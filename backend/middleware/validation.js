const { check } = require('express-validator');
const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
  };
};

const validateLogin = [
  check('email').isEmail().normalizeEmail(),
  check('password').not().isEmpty()
];

const validateRegister = [
  check('name').not().isEmpty().trim().escape(),
  check('email').isEmail().normalizeEmail(),
  check('password').isLength({ min: 6 }),
  check('role').isIn(['job_seeker', 'employer', 'admin']).optional()
];

module.exports = {
  validate,
  validateLogin,
  validateRegister
};
