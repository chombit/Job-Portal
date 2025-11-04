const { Job, SavedJob } = require('../models');
const { AppError, NotFoundError } = require('../middleware/errorHandler');

// @desc    Get my saved jobs
// @route   GET /api/v1/saved-jobs
// @access  Private
exports.getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.findAll({
      where: { user_id: req.user.id },
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
      count: savedJobs.length,
      data: savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a job
// @route   POST /api/v1/jobs/:jobId/save
// @access  Private
exports.saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { notes } = req.body;

    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Check if job is already saved
    const existingSavedJob = await SavedJob.findOne({
      where: {
        user_id: req.user.id,
        job_id: jobId,
      },
    });

    if (existingSavedJob) {
      throw new AppError('Job already saved', 400);
    }

    // Save job
    const savedJob = await SavedJob.create({
      user_id: req.user.id,
      job_id: jobId,
      notes,
    });

    res.status(201).json({
      success: true,
      data: savedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update saved job notes
// @route   PUT /api/v1/saved-jobs/:id
// @access  Private
exports.updateSavedJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const savedJob = await SavedJob.findOne({
      where: {
        id,
        user_id: req.user.id,
      },
    });

    if (!savedJob) {
      throw new NotFoundError('Saved job not found');
    }

    // Update notes
    savedJob.notes = notes || savedJob.notes;
    await savedJob.save();

    res.status(200).json({
      success: true,
      data: savedJob,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove saved job
// @route   DELETE /api/v1/saved-jobs/:id
// @access  Private
exports.removeSavedJob = async (req, res, next) => {
  try {
    const savedJob = await SavedJob.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (!savedJob) {
      throw new NotFoundError('Saved job not found');
    }

    await savedJob.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if job is saved
// @route   GET /api/v1/jobs/:jobId/is-saved
// @access  Private
exports.checkIfJobIsSaved = async (req, res, next) => {
  try {
    const savedJob = await SavedJob.findOne({
      where: {
        user_id: req.user.id,
        job_id: req.params.jobId,
      },
      attributes: ['id', 'notes', 'created_at'],
    });

    res.status(200).json({
      success: true,
      isSaved: !!savedJob,
      data: savedJob || null,
    });
  } catch (error) {
    next(error);
  }
};
