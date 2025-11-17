const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { Job, User, Application } = require('../models');
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
    const order = [];
    const where = { status: 'published' }; 

    if (sort) {
      const [field, direction] = sort.startsWith('-') 
        ? [sort.substring(1), 'DESC'] 
        : [sort, 'ASC'];
      
      order.push([field, direction]);
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { '$employer.name$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (location) where.location = { [Op.iLike]: `%${location}%` };
    if (jobType) where.job_type = jobType;
    if (experience) where.experience_level = experience;
    if (isRemote !== undefined) where.is_remote = isRemote === 'true';
    
    if (minSalary || maxSalary) {
      where.salary_range = {};
      if (minSalary) where.salary_range[Op.gte] = parseInt(minSalary);
      if (maxSalary) where.salary_range[Op.lte] = parseInt(maxSalary);
    }

    const include = [
      {
        model: User,
        as: 'employer',
        attributes: ['id', 'name', 'profile_data'],
        where: { is_active: true },
        required: true,
      },
    ];

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total: count,
      totalPages,
      currentPage: parseInt(page),
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    
    console.log('getJob called with ID:', jobId, 'Type:', typeof jobId);
    
    // Validate job ID
    if (!jobId || jobId === 'undefined') {
      console.log('Job ID validation failed - ID is missing or undefined');
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Temporarily remove UUID validation to debug
    // const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    // if (!uuidRegex.test(jobId)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid job ID format'
    //   });
    // }

    console.log('Attempting to find job with ID:', jobId);
    const job = await Job.findByPk(jobId, {
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'name', 'profileData'],
        },
      ],
    });

    console.log('Job found:', job ? 'Yes' : 'No');
    if (job) {
      console.log('Job details:', {
        id: job.id,
        title: job.title,
        status: job.status,
        employerId: job.employerId
      });
    }

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'published' && 
        (!req.user || (req.user.role !== 'admin' && job.employerId !== req.user.id))) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not published'
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
    
  } catch (error) {
    console.error('Error in getJob:', {
      error: error.message,
      jobId: req.params.id,
      userId: req.user?.id
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
exports.createJob = async (req, res, next) => {
  try {
    console.log('User creating job:', req.user);
    
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      console.log('Unauthorized user role:', req.user.role); 
      return res.status(403).json({ error: 'Not authorized to create jobs' });
    }

    const requiredFields = ['title', 'description', 'location', 'jobType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields); 
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    const jobData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      jobType: req.body.jobType.toLowerCase(),
      employerId: req.user.id, 
      status: req.body.status || 'draft',
      isRemote: req.body.isRemote || false,
      experienceLevel: req.body.experienceLevel ? req.body.experienceLevel.toLowerCase() : null,
      salaryRange: req.body.salaryMin || req.body.salaryMax ? {
        min: req.body.salaryMin,
        max: req.body.salaryMax,
        currency: req.body.salaryCurrency || 'USD',
        period: req.body.salaryPeriod || 'year'
      } : null,
      skills: req.body.skills || [],
      applicationDeadline: req.body.applicationDeadline || null
    };

    console.log('Creating job with data:', jobData); 

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error in createJob:', error); 
    next(error);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (req.user.role !== 'admin' && job.employer_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to update this job');
    }

    const { employer_id, ...updateData } = req.body;
    
    await job.update(updateData);

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (req.user.role !== 'admin' && job.employer_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to delete this job');
    }

    await job.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

exports.applyForJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;
    const job = await Job.findOne({
      where: {
        id: jobId,
        status: 'published',
      },
    });

    if (!job) {
      throw new NotFoundError('Job not found or not accepting applications');
    }

    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      throw new AppError('Application deadline has passed', 400);
    }
    const existingApplication = await Application.findOne({
      where: {
        job_id: jobId,
        user_id: userId,
      },
    });

    if (existingApplication) {
      throw new AppError('You have already applied for this job', 400);
    }

    if (!req.files || !req.files.resume) {
      throw new AppError('Please upload your resume', 400);
    }

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
    await resumeFile.mv(uploadPath);

    const application = await Application.create({
      job_id: jobId,
      user_id: userId,
      status: 'pending',
      resume: resumeFileName,
      applied_at: new Date(),
    });

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getJobsByEmployer = async (req, res, next) => {
  try {
    const { employerId } = req.params;
    
    const jobs = await Job.findAll({
      where: {
        employer_id: employerId,
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'name', 'email', 'company', 'logo']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
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
    const where = { employer_id: req.user.id };
    
    if (status) {
      where.status = status;
    }

    const jobs = await Job.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Application,
          as: 'applications',
          attributes: ['id', 'status', 'created_at'],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: jobs,
      count: jobs.length
    });
  } catch (error) {
    next(error);
  }
};
