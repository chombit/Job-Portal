const { Application, Job, User } = require('../models');
const { AppError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler');


exports.applyForJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'job_seeker') {
      throw new ForbiddenError('Only job seekers can apply for jobs');
    }

    const { jobId } = req.params;
    const { coverLetter, resumeUrl } = req.body;

    const job = await Job.findOne({
      where: { 
        id: jobId,
        status: 'published',
      },
    });

    if (!job) {
      throw new NotFoundError('Job not found or not accepting applications');
    }

    if (job.application_deadline && new Date(job.application_deadline) < new Date()) {
      throw new AppError('Application deadline has passed', 400);
    }

    const existingApplication = await Application.findOne({
      where: {
        jobId: jobId,
        applicantId: req.user.id,
      },
    });

    if (existingApplication) {
      throw new AppError('You have already applied for this job', 400);
    }
    const application = await Application.create({
      jobId: jobId,
      applicantId: req.user.id,
      coverLetter: coverLetter,
      resumeUrl: resumeUrl,
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
exports.getMyApplications = async (req, res, next) => {
  try {
    console.log('Fetching applications for user:', req.user.id);
    
    // First, verify the user exists
    const user = await User.findByPk(req.user.id);
    if (!user) {
      console.error('User not found:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log database connection info
    console.log('Database connection status:', Application.sequelize.connectionManager.pool);
    
    // Get applications with detailed error handling
    let applications;
    try {
      applications = await Application.findAll({
        where: { applicantId: req.user.id },
        include: [
          {
            model: Job,
            as: 'job',
            required: false, // Use LEFT JOIN to include applications even if job is deleted
            include: [
              {
                model: User,
                as: 'employer',
                attributes: ['id', 'name', 'profileData'],
                required: false, // Use LEFT JOIN to include job even if employer is deleted
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      console.log('Raw applications from DB:', JSON.stringify(applications, null, 2));
    } catch (dbError) {
      console.error('Database error in getMyApplications:', {
        message: dbError.message,
        name: dbError.name,
        stack: dbError.stack,
        original: dbError.original
      });
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Safely transform the data
    const formattedApplications = applications.map(app => {
      try {
        return {
          id: app.id,
          status: app.status || 'pending',
          appliedDate: app.createdAt,
          job: app.job ? {
            id: app.job.id,
            title: app.job.title || 'Unknown Position',
            location: app.job.location || 'Location not specified',
            employer: app.job.employer ? {
              id: app.job.employer.id,
              name: app.job.employer.name || 'Unknown Company',
              profileData: app.job.employer.profileData || {}
            } : {
              id: 'unknown',
              name: 'Unknown Company',
              profileData: {}
            }
          } : {
            id: 'deleted-job',
            title: 'Job no longer available',
            location: 'N/A',
            employer: {
              id: 'unknown',
              name: 'Unknown Company',
              profileData: {}
            }
          }
        };
      } catch (transformError) {
        console.error('Error transforming application:', {
          applicationId: app.id,
          error: transformError.message
        });
        return null;
      }
    }).filter(Boolean); // Remove any null entries from transformation errors

    console.log(`Successfully formatted ${formattedApplications.length} applications`);
    
    return res.status(200).json({
      success: true,
      data: formattedApplications
    });
    
  } catch (error) {
    console.error('Error in getMyApplications:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...(error.original && { originalError: error.original })
    });
    
    // Send detailed error in development, generic in production
    const errorResponse = {
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? `Error fetching applications: ${error.message}`
        : 'Failed to fetch applications. Please try again later.'
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        name: error.name,
        message: error.message,
        ...(error.stack && { stack: error.stack })
      };
    }
    
    res.status(500).json(errorResponse);
  }
};
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
      where.jobId = jobId;
    }

    const applications = await Application.findAll({
      where,
      include: [
        {
          model: Job,
          as: 'job',
          where: { employerId: req.user.id },
          attributes: ['id', 'title', 'status'],
          required: true,
        },
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'name', 'email', 'profile_data'],
        },
      ],
      order: [['createdAt', 'DESC']],
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
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'employerId', 'title'],
        },
      ],
    });
    if (!application) {
      throw new NotFoundError('Application not found');
    }
    if (req.user.role !== 'admin' && application.job.employerId !== req.user.id) {
      throw new ForbiddenError('Not authorized to update this application');
    }
    const validStatuses = ['pending', 'reviewed', 'interview', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }
    application.status = status;
    await application.save();
    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findByPk(req.params.id);

    if (!application) {
      throw new NotFoundError('Application not found');
    }
    if (application.applicant_id !== req.user.id) {
      throw new ForbiddenError('Not authorized to withdraw this application');
    }
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
