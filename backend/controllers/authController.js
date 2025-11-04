const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError, UnauthorizedError } = require('../middleware/errorHandler');

// Generate JWT token
const generateToken = (id, role, isActive = true) => {
  return jwt.sign(
    { 
      id, 
      role, 
      isActive: isActive !== false // Ensure isActive is always a boolean, default to true
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role if provided
    const allowedRoles = ['job_seeker', 'employer', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      throw new AppError('Invalid role specified', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Create user with the provided role or default to 'job_seeker'
    const user = await User.create({
      name,
      email,
      password,
      role: role,
    });

    // Generate token with isActive status
    const token = generateToken(user.id, user.role, user.isActive);

    // Get user data without password
    const userData = user.get({ plain: true });
    delete userData.password;

    res.status(201).json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validPassword(password))) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    //if (!user.is_active) {
    //  throw new UnauthorizedError('Account is deactivated');
    //}

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Generate token with isActive status
    const token = generateToken(user.id, user.role, user.isActive);

    // Remove password from output
    const userData = user.get({ plain: true });
    delete userData.password;

    res.status(200).json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await User.findByPk(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update user
    await user.update(fieldsToUpdate);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check current password
    if (!(await user.validPassword(req.body.currentPassword))) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Update password
    user.password = req.body.newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};
