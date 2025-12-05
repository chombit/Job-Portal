const path = require('path');
const fs = require('fs');
const { supabase } = require('../config/supabaseClient');
const { AppError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

const uploadsDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

exports.getJobs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      jobType,
      experience,
      isRemote,
      minSalary,
      maxSalary,
      sort = '-created_at',
    } = req.query;

    const offset = (page - 1) * limit;

    // Start building the query
    let query = supabase
      .from('jobs')
      .select('*, employer:profiles!employer_id(id, name, email)', { count: 'exact' })
      .eq('status', 'published');

    // Search filter
    if (search) {
      // Supabase doesn't support OR across different tables easily in one go without RPC
      // For now, we'll search on job fields. 
      // To search employer name, we'd need a more complex query or join filter
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Location filter
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    // Job Type filter
    if (jobType) {
      const types = Array.isArray(jobType) ? jobType : [jobType];
      // Normalize types if needed, but assuming frontend sends correct values
      query = query.in('job_type', types.map(t => t.toLowerCase()));
    }

    // Experience Level filter
    if (experience) {
      const levels = Array.isArray(experience) ? experience : [experience];
      query = query.in('experience_level', levels.map(l => l.toLowerCase().split(' ')[0]));
    }

    // Remote filter
    if (isRemote !== undefined) {
      query = query.eq('is_remote', isRemote === 'true');
    }

    // Salary filter (JSONB)
    // Note: JSONB filtering in Supabase JS client can be tricky. 
    // We might skip complex salary filtering for now or use a raw PostgREST filter if needed.

    // Sorting
    if (sort) {
      const [field, direction] = sort.startsWith('-')
        ? [sort.substring(1), { ascending: false }]
        : [sort, { ascending: true }];

      // Map camelCase to snake_case if needed
      const dbField = field === 'createdAt' ? 'created_at' : field;
      query = query.order(dbField, direction);
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: jobs, error, count } = await query;

    if (error) {
      throw new AppError(error.message, 500);
    }

    const totalPages = Math.ceil(count / limit);

    // Transform data to match frontend expectations (camelCase)
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      jobType: job.job_type,
      salaryRange: job.salary_range,
      skills: job.skills,
      experienceLevel: job.experience_level,
      isRemote: job.is_remote,
      status: job.status,
      applicationDeadline: job.application_deadline,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      employer: job.employer,
      employerId: job.employer_id
    }));

    res.status(200).json({
      success: true,
      count: formattedJobs.length,
      total: count,
      totalPages,
      currentPage: parseInt(page),
      data: formattedJobs,
    });
  } catch (error) {
    next(error);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;

    // Validate UUID
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!jobId || !uuidV4Regex.test(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID.'
      });
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .select('*, employer:profiles!employer_id(id, name, profile_data)')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check visibility
    if (job.status !== 'published' &&
      (!req.user || (req.user.role !== 'admin' && job.employer_id !== req.user.id))) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not published'
      });
    }

    let hasApplied = false;

    if (req.user?.role === 'job_seeker') {
      const { data: application } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', job.id)
        .eq('applicant_id', req.user.id)
        .single();

      hasApplied = !!application;
    }

    // Format response
    const jobData = {
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      jobType: job.job_type,
      salaryRange: job.salary_range,
      skills: job.skills,
      experienceLevel: job.experience_level,
      isRemote: job.is_remote,
      status: job.status,
      applicationDeadline: job.application_deadline,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      employer: {
        id: job.employer.id,
        name: job.employer.name,
        profileData: job.employer.profile_data
      },
      employerId: job.employer_id,
      hasApplied
    };

    return res.status(200).json({
      success: true,
      data: jobData,
    });

  } catch (error) {
    console.error('Error in getJob:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.createJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to create jobs' });
    }

    const requiredFields = ['title', 'description', 'location', 'jobType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const jobData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      job_type: req.body.jobType.toLowerCase(),
      employer_id: req.user.id,
      status: req.body.status || 'draft',
      is_remote: req.body.isRemote || false,
      experience_level: req.body.experienceLevel ? req.body.experienceLevel.toLowerCase() : null,
      salary_range: req.body.salaryMin || req.body.salaryMax ? {
        min: req.body.salaryMin,
        max: req.body.salaryMax,
        currency: req.body.salaryCurrency || 'USD',
        period: req.body.salaryPeriod || 'year'
      } : null,
      skills: req.body.skills || [],
      application_deadline: req.body.applicationDeadline || null
    };

    const { data: job, error } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(201).json({
      success: true,
      data: {
        ...job,
        jobType: job.job_type,
        isRemote: job.is_remote,
        experienceLevel: job.experience_level,
        salaryRange: job.salary_range,
        applicationDeadline: job.application_deadline,
        createdAt: job.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !job) {
      throw new NotFoundError('Job not found');
    }

    if (req.user.role !== 'admin' && job.employer_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to update this job');
    }

    const { employerId, ...updateData } = req.body;

    // Map camelCase to snake_case
    const dbUpdateData = {};
    if (updateData.title) dbUpdateData.title = updateData.title;
    if (updateData.description) dbUpdateData.description = updateData.description;
    if (updateData.location) dbUpdateData.location = updateData.location;
    if (updateData.jobType) dbUpdateData.job_type = updateData.jobType;
    if (updateData.status) dbUpdateData.status = updateData.status;
    if (updateData.isRemote !== undefined) dbUpdateData.is_remote = updateData.isRemote;
    if (updateData.experienceLevel) dbUpdateData.experience_level = updateData.experienceLevel;
    if (updateData.skills) dbUpdateData.skills = updateData.skills;
    if (updateData.applicationDeadline) dbUpdateData.application_deadline = updateData.applicationDeadline;
    if (updateData.salaryRange) dbUpdateData.salary_range = updateData.salaryRange;

    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update(dbUpdateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(200).json({
      success: true,
      data: {
        ...updatedJob,
        jobType: updatedJob.job_type,
        isRemote: updatedJob.is_remote,
        experienceLevel: updatedJob.experience_level,
        salaryRange: updatedJob.salary_range,
        applicationDeadline: updatedJob.application_deadline,
        createdAt: updatedJob.created_at
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !job) {
      throw new NotFoundError('Job not found');
    }

    if (req.user.role !== 'admin' && job.employer_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to delete this job');
    }

    // Supabase cascade delete handles related records (applications, saved_jobs)
    const { error } = await supabase
      .from('jobs')
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

exports.getJobsByEmployer = async (req, res, next) => {
  try {
    const { employerId } = req.params;

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*, employer:profiles!employer_id(id, name, email, profile_data)')
      .eq('employer_id', employerId)
      .eq('status', 'published') // Assuming public view only shows published
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(error.message, 500);
    }

    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      jobType: job.job_type,
      salaryRange: job.salary_range,
      skills: job.skills,
      experienceLevel: job.experience_level,
      isRemote: job.is_remote,
      status: job.status,
      applicationDeadline: job.application_deadline,
      createdAt: job.created_at,
      employer: {
        id: job.employer.id,
        name: job.employer.name,
        email: job.employer.email,
        // Map profile_data to company/logo if stored there
        company: job.employer.profile_data?.company,
        logo: job.employer.profile_data?.logo
      }
    }));

    res.status(200).json({
      success: true,
      count: formattedJobs.length,
      data: formattedJobs
    });
  } catch (error) {
    console.error('Error in getJobsByEmployer:', error);
    next(error);
  }
};

exports.getMyJobs = async (req, res, next) => {
  try {
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      throw new ForbiddenError('Only employers can view their posted jobs');
    }

    const { status } = req.query;
    let query = supabase
      .from('jobs')
      .select('*, applications(id, status, created_at)')
      .eq('employer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: jobs, error } = await query;

    if (error) {
      throw new AppError(error.message, 500);
    }

    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      jobType: job.job_type,
      salaryRange: job.salary_range,
      skills: job.skills,
      experienceLevel: job.experience_level,
      isRemote: job.is_remote,
      status: job.status,
      applicationDeadline: job.application_deadline,
      createdAt: job.created_at,
      applications: job.applications
    }));

    res.status(200).json({
      success: true,
      data: formattedJobs,
      count: formattedJobs.length
    });
  } catch (error) {
    next(error);
  }
};
