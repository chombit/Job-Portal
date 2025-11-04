const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { verifyToken } = require('../utils/jwt');

// Define authorize first since it's used in the routes
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};

// Then define auth
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Get user from the token
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      if (user.isActive === false) {
        return res.status(401).json({ error: 'User account is inactive' });
      }

      // Add user from payload
      req.user = {
        id: user.id,
        role: user.role,
        ...user.get({ plain: true })
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ 
        error: 'Token is not valid',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { auth, authorize };