const { Op } = require('sequelize');
const { Job, User, Application } = require('../models');
const { AppError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

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
    const where = { status: 'published' }; // Only show published jobs

    // Handle sorting
    if (sort) {
      const [field, direction] = sort.startsWith('-') 
        ? [sort.substring(1), 'DESC'] 
        : [sort, 'ASC'];
      
      order.push([field, direction]);
    }

    // Add search conditions
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
    
    // Handle salary range
    if (minSalary || maxSalary) {
      where.salary_range = {};
      if (minSalary) where.salary_range[Op.gte] = parseInt(minSalary);
      if (maxSalary) where.salary_range[Op.lte] = parseInt(maxSalary);
    }

    // Include employer details
    const include = [
      {
        model: User,
        as: 'employer',
        attributes: ['id', 'name', 'profile_data'],
        where: { is_active: true },
        required: true,
      },
    ];

    // Get jobs with pagination
    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Calculate total pages
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

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'employer',
          attributes: ['id', 'name', 'profile_data'],
        },
      ],
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // If job is not published and user is not the owner or admin
    if (job.status !== 'published' && 
        (!req.user || (req.user.role !== 'admin' && req.user.id !== job.employer_id))) {
      throw new NotFoundError('Job not found');
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create job
// @route   POST /api/jobs
// @access  Private (Employer/Admin)
exports.createJob = async (req, res, next) => {
  try {
    console.log('User creating job:', req.user); // Debug log
    
    // Ensure the user is an employer or admin
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      console.log('Unauthorized user role:', req.user.role); // Debug log
      return res.status(403).json({ error: 'Not authorized to create jobs' });
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'location', 'jobType'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields); // Debug log
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Prepare job data with correct field names that match the model
    const jobData = {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      jobType: req.body.jobType.toLowerCase(), // Ensure lowercase to match enum values
      employerId: req.user.id, // Use the authenticated user's ID
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

    console.log('Creating job with data:', jobData); // Debug log

    // Create the job
    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error in createJob:', error); // Debug log
    next(error);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Job Owner/Admin)
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Check if user is the owner or admin
    if (req.user.role !== 'admin' && job.employer_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to update this job');
    }

    // Prevent changing employer_id
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

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Job Owner/Admin)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Check if user is the owner or admin
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

// @route   GET /api/jobs/employer/:employerId
// @access  Public
exports.getJobsByEmployer = async (req, res, next) => {
  try {
    const { employerId } = req.params;
    
    // Find all active jobs for the specified employer
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

// @desc    Get jobs posted by current employer
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer)
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
