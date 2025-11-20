const { User, Job } = require('../models');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalJobs = await Job.count();
    const totalEmployers = await User.count({ where: { role: 'employer' } });
    const totalJobSeekers = await User.count({ where: { role: 'job_seeker' } });
    const pendingApprovals = await Job.count({ where: { status: 'draft' } });

    res.status(200).json({
      totalUsers,
      totalJobs,
      totalEmployers,
      totalJobSeekers,
      pendingApprovals,
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    next(error);
  }
};

exports.getRecentUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getRecentUsers:', error);
    next(error);
  }
};
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'isActive']
    });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.getRecentJobs = async (req, res, next) => {
  try {
    const jobs = await Job.findAll({
      include: [{
        model: User,
        as: 'employer',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

exports.getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.findAll({
      include: [{
        model: User,
        as: 'employer',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(jobs);
  } catch (error) {
    next(error);
  }
};

exports.getPendingApprovals = async (req, res, next) => {
  try {
    const pendingJobs = await Job.findAll({
      where: { status: 'draft' },
      include: [{
        model: User,
        as: 'employer',
        attributes: ['id', 'name', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    const pendingUsers = await User.findAll({
      where: { isActive: false },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      pendingJobs,
      pendingUsers,
      total: pendingJobs.length + pendingUsers.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const job = await Job.findByPk(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    await job.update({ status });
    
    res.status(200).json(job);
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.update({ isActive });
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
