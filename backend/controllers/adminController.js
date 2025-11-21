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
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, company } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      company: role === 'employer' ? company : null,
      isActive: true // Automatically activate admin-created users
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.get({ plain: true });
    
    res.status(201).json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    next(error);
  }
};
// In adminController.js
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Remove password from response
    const { password, ...userData } = user.get({ plain: true });
    res.status(200).json(userData);
  } catch (error) {
    next(error);
  }
};