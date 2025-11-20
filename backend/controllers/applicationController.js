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
    const applications = await Application.findAll({
      where: { applicantId: req.user.id },
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
