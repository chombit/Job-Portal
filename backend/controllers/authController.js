const jwt = require('jsonwebtoken');
const db = require('../models');
const { User } = db;
const { AppError, UnauthorizedError } = require('../middleware/errorHandler');

// Helper function to safely get error message
const getErrorMessage = (error) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    };
  }
  return { message: String(error) };
};

const generateToken = (id, role, isActive = true) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { 
      id, 
      role, 
      isActive: isActive !== false,
      iat: Math.floor(Date.now() / 1000)
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
      algorithm: 'HS256'
    }
  );
};
exports.register = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    console.log('📝 Registration attempt:', { 
      email: req.body.email,
      timestamp: new Date().toISOString()
    });
    
    const { name, email, password, role = 'job_seeker' } = req.body;

    // Input validation
    if (!name || !email || !password) {
      await transaction.rollback();
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 8) {
      await transaction.rollback();
      console.log('❌ Password too short');
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    const allowedRoles = ['job_seeker', 'employer', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      await transaction.rollback();
      console.log('❌ Invalid role specified:', role);
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Check for existing user
    console.log('🔍 Checking for existing user...');
    const existingUser = await User.findOne({ 
      where: { email },
      transaction
    });

    if (existingUser) {
      await transaction.rollback();
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    console.log('👤 Creating new user...');
    const user = await User.create({
      name,
      email,
      password,
      role,
      isActive: true,
      last_login: new Date()
    }, { transaction });

    // Generate token
    console.log('🔐 Generating token...');
    const token = generateToken(user.id, user.role, user.isActive);
    
    // Remove sensitive data
    const userData = user.get({ plain: true });
    delete userData.password;

    await transaction.commit();
    
    console.log('✅ User registered successfully:', user.id);
    
    return res.status(201).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    await transaction.rollback();
    
    console.error('🔥 Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error.errors && { errors: error.errors.map(e => e.message) })
    });
    
    if (error.name === 'SequelizeValidationError' || 
        error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(e => e.message).join('. ');
      return res.status(400).json({
        success: false,
        message: messages || 'Validation error'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};
exports.login = async (req, res) => {
  console.log('🔑 Login attempt received:', { 
    email: req.body.email,
    timestamp: new Date().toISOString()
  });

  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Find user
    console.log('🔍 Looking up user:', email);
    let user;
    try {
      user = await User.findOne({ where: { email } });
    } catch (dbError) {
      console.error('❌ Database error when finding user:', {
        error: dbError.message,
        stack: dbError.stack
      });
      return res.status(500).json({
        success: false,
        message: 'Database error during user lookup',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      console.log('❌ Inactive account:', email);
      return res.status(401).json({
        success: false,
        message: 'This account has been deactivated'
      });
    }

    // Validate password
    console.log('🔒 Validating password...');
    let isMatch;
    try {
      isMatch = await user.validPassword(password);
      console.log('Password validation result:', isMatch);
    } catch (pwError) {
      console.error('❌ Error during password validation:', {
        error: pwError.message,
        stack: pwError.stack,
        userId: user.id
      });
      return res.status(500).json({
        success: false,
        message: 'Error during password validation',
        error: process.env.NODE_ENV === 'development' ? pwError.message : undefined
      });
    }

    if (!isMatch) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    console.log('🔐 Generating token...');
    let token;
    try {
      token = generateToken(user.id, user.role, user.isActive);
    } catch (tokenError) {
      console.error('❌ Error generating token:', {
        error: tokenError.message,
        stack: tokenError.stack,
        userId: user.id
      });
      return res.status(500).json({
        success: false,
        message: 'Error generating authentication token',
        error: process.env.NODE_ENV === 'development' ? tokenError.message : undefined
      });
    }
    
    // Update last login
    try {
      user.lastLogin = new Date();
      await user.save();
    } catch (saveError) {
      console.error('❌ Error updating last login:', {
        error: saveError.message,
        stack: saveError.stack,
        userId: user.id
      });
      // Continue execution as this is not a critical error
    }

    // Prepare response
    const userData = user.get({ plain: true });
    delete userData.password;

    console.log('✅ Login successful for user:', user.id);
    
    return res.status(200).json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error('🔥 Unhandled login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      request: {
        body: { ...req.body, password: req.body.password ? '***' : undefined }
      }
    });
    
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
