const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError, UnauthorizedError } = require('../middleware/errorHandler');

const generateToken = (id, role, isActive = true) => {
  return jwt.sign(
    { 
      id, 
      role, 
      isActive: isActive !== false 
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    
    const allowedRoles = ['job_seeker', 'employer', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      throw new AppError('Invalid role specified', 400);
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }
    const user = await User.create({
      name,
      email,
      password,
      role: role,
    });
    const token = generateToken(user.id, user.role, user.isActive);
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
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validPassword(password))) {
      throw new UnauthorizedError('Invalid credentials');
    }
    user.last_login = new Date();
    await user.save();
    const token = generateToken(user.id, user.role, user.isActive);
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
    await user.update(fieldsToUpdate);
    user.password = undefined;

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (!(await user.validPassword(req.body.currentPassword))) {
      throw new UnauthorizedError('Current password is incorrect');
    }
    user.password = req.body.newPassword;
    await user.save();
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
