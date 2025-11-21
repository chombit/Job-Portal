const { ValidationError } = require('sequelize');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors = null;

  if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    err.errors.forEach((error) => {
      errors[error.path] = error.message;
    });
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Duplicate entry';
    errors = { [err.errors[0].path]: 'This value is already in use' };
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.statusCode) {
  
    statusCode = err.statusCode;
    message = err.message;
  }
  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 400;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Not authorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

module.exports = {
  errorHandler,
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
};
