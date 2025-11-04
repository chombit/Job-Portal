const { Application, Job, User } = require('../models');
const { AppError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

// @desc    Apply for a job
// @route   POST /api/v1/jobs/:jobId/apply
// @access  Private (Job Seeker)
exports.applyForJob = async (req, res, next) => {
  try {
    // Only job seekers can apply for jobs
    if (req.user.role !== 'job_seeker') {
      throw new ForbiddenError('Only job seekers can apply for jobs');
    }

    const { jobId } = req.params;
    const { coverLetter, resumeUrl } = req.body;

    // Check if job exists and is published
    const job = await Job.findOne({
      where: { 
        id: jobId,
        status: 'published',
      },
    });

    if (!job) {
      throw new NotFoundError('Job not found or not accepting applications');
    }

    // Check if application deadline has passed
    if (job.application_deadline && new Date(job.application_deadline) < new Date()) {
      throw new AppError('Application deadline has passed', 400);
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      where: {
        job_id: jobId,
        applicant_id: req.user.id,
      },
    });

    if (existingApplication) {
      throw new AppError('You have already applied for this job', 400);
    }

    // Create application
    const application = await Application.create({
      job_id: jobId,
      applicant_id: req.user.id,
      cover_letter: coverLetter,
      resume_url: resumeUrl,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my applications
// @route   GET /api/v1/applications/me
// @access  Private (Job Seeker)
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.findAll({
      where: { applicant_id: req.user.id },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: User,
              as: 'employer',
              attributes: ['id', 'name', 'profile_data'],
            },
          ],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for my jobs
// @route   GET /api/v1/applications/my-jobs
// @access  Private (Employer)
exports.getApplicationsForMyJobs = async (req, res, next) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      throw new ForbiddenError('Only employers can view applications for their jobs');
    }

    const { status, jobId } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }

    if (jobId) {
      where.job_id = jobId;
    }

    // Get applications for jobs posted by the current employer
    const applications = await Application.findAll({
      where,
      include: [
        {
          model: Job,
          as: 'job',
          where: { employer_id: req.user.id },
          attributes: ['id', 'title', 'status'],
          required: true,
        },
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'name', 'email', 'profile_data'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/v1/applications/:id/status
// @access  Private (Job Owner/Admin)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'employer_id', 'title'],
        },
      ],
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // Check if user is the job owner or admin
    if (req.user.role !== 'admin' && application.job.employer_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to update this application');
    }

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'interview', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    // Update status
    application.status = status;
    await application.save();

    // In a real app, you might want to send an email notification here

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw application
// @route   DELETE /api/v1/applications/:id
// @access  Private (Applicant)
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // Check if the application belongs to the current user
    if (application.applicant_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to withdraw this application');
    }

    // Only allow withdrawal if the application is still pending
    if (application.status !== 'pending') {
      throw new AppError('Cannot withdraw application that is not in pending status', 400);
    }

    await application.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
