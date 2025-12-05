const path = require('path');
const { supabase } = require('../config/supabaseClient');
const { AppError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

exports.applyForJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'job_seeker') {
      throw new ForbiddenError('Only job seekers can apply for jobs');
    }

    const { jobId } = req.params;
    const { coverLetter, resumeUrl } = req.body; // Assuming resumeUrl is passed if using external storage, or we handle file upload

    // Check if job exists and is published
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('status', 'published')
      .single();

    if (jobError || !job) {
      throw new NotFoundError('Job not found or not accepting applications');
    }

    if (job.application_deadline && new Date(job.application_deadline) < new Date()) {
      throw new AppError('Application deadline has passed', 400);
    }

    // Check for existing application
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('applicant_id', req.user.id)
      .single();

    if (existingApplication) {
      throw new AppError('You have already applied for this job', 400);
    }

    // Handle resume upload if file is present in request (legacy support)
    let finalResumeUrl = resumeUrl;

    // Note: In a full Supabase migration, we should use Supabase Storage.
    // For now, we'll support the existing file upload to local disk if req.files exists
    // OR accept a resumeUrl if the frontend uploads directly to Supabase Storage.

    if (req.files && req.files.resume) {
      const resumeFile = req.files.resume;
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(resumeFile.mimetype)) {
        throw new AppError('Please upload a valid resume (PDF or Word document)', 400);
      }

      if (resumeFile.size > maxSize) {
        throw new AppError('Resume size should be less than 5MB', 400);
      }

      const resumeFileName = `resume-${Date.now()}-${resumeFile.name}`;
      const uploadPath = path.join(__dirname, '../uploads/resumes', resumeFileName);

      // Use mv method from express-fileupload
      await resumeFile.mv(uploadPath);
      finalResumeUrl = resumeFileName;
    } else if (!finalResumeUrl) {
      // If no file and no URL provided
      throw new AppError('Please upload your resume', 400);
    }

    const { data: application, error: createError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        applicant_id: req.user.id,
        cover_letter: coverLetter,
        resume_url: finalResumeUrl,
        status: 'pending'
      })
      .select()
      .single();

    if (createError) {
      throw new AppError(createError.message, 400);
    }

    res.status(201).json({
      success: true,
      data: {
        ...application,
        jobId: application.job_id,
        applicantId: application.applicant_id,
        coverLetter: application.cover_letter,
        resumeUrl: application.resume_url,
        createdAt: application.created_at
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs!job_id (
          id, 
          title, 
          location, 
          employer:profiles!employer_id (id, name, profile_data)
        )
      `)
      .eq('applicant_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(error.message, 500);
    }

    const formattedApplications = applications.map(app => ({
      id: app.id,
      status: app.status,
      appliedDate: app.created_at,
      job: app.job ? {
        id: app.job.id,
        title: app.job.title,
        location: app.job.location,
        employer: app.job.employer ? {
          id: app.job.employer.id,
          name: app.job.employer.name,
          profileData: app.job.employer.profile_data
        } : { name: 'Unknown Company' }
      } : { title: 'Job no longer available' }
    }));

    return res.status(200).json({
      success: true,
      data: formattedApplications
    });
  } catch (error) {
    next(error);
  }
};

exports.getApplicationsForMyJobs = async (req, res, next) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      throw new ForbiddenError('Only employers can view applications for their jobs');
    }

    const { status, jobId } = req.query;

    // We need to find applications where the job's employer_id is the current user
    // Supabase filtering on related tables is possible

    let query = supabase
      .from('applications')
      .select(`
        *,
        job:jobs!job_id!inner (id, title, status, employer_id),
        applicant:profiles!applicant_id (id, name, email, profile_data)
      `)
      .eq('job.employer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    const { data: applications, error } = await query;

    if (error) {
      throw new AppError(error.message, 500);
    }

    const formattedApplications = applications.map(app => ({
      id: app.id,
      status: app.status,
      createdAt: app.created_at,
      coverLetter: app.cover_letter,
      resumeUrl: app.resume_url,
      job: {
        id: app.job.id,
        title: app.job.title,
        status: app.job.status
      },
      applicant: {
        id: app.applicant.id,
        name: app.applicant.name,
        email: app.applicant.email,
        profile_data: app.applicant.profile_data
      }
    }));

    res.status(200).json({
      success: true,
      count: formattedApplications.length,
      data: formattedApplications,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'reviewed', 'interview', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    // Fetch application with job details to check ownership
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*, job:jobs!job_id(employer_id)')
      .eq('id', id)
      .single();

    if (fetchError || !application) {
      throw new NotFoundError('Application not found');
    }

    if (req.user.role !== 'admin' && application.job.employer_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to update this application');
    }

    const { data: updatedApp, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(200).json({
      success: true,
      data: updatedApp,
    });
  } catch (error) {
    next(error);
  }
};

exports.withdrawApplication = async (req, res, next) => {
  try {
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !application) {
      throw new NotFoundError('Application not found');
    }

    if (application.applicant_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to withdraw this application');
    }

    if (application.status !== 'pending') {
      throw new AppError('Cannot withdraw application that is not in pending status', 400);
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      throw new AppError(error.message, 500);
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
