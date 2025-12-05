class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

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

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error('Error 💥:', err);
  }

  // Handle Supabase/Postgres Errors
  if (err.code) {
    // Postgres unique violation
    if (err.code === '23505') {
      err = new AppError('Duplicate field value entered', 400);
    }
    // Postgres foreign key violation
    if (err.code === '23503') {
      err = new AppError('Invalid reference ID', 400);
    }
    // Postgres invalid input syntax for type uuid
    if (err.code === '22P02') {
      err = new AppError('Invalid ID format', 400);
    }
  }

  // Handle JWT Errors (if any remain)
  if (err.name === 'JsonWebTokenError') {
    err = new UnauthorizedError('Invalid token. Please log in again.');
  }
  if (err.name === 'TokenExpiredError') {
    err = new UnauthorizedError('Your token has expired. Please log in again.');
  }

  // Send Error Response
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, error: err }),
  });
};

module.exports = {
  errorHandler,
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
};
