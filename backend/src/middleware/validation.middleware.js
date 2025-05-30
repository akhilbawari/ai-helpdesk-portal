const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        message: detail.message,
        path: detail.path
      }));
      
      logger.warn(`Validation error: ${JSON.stringify(errorDetails)}`);
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails
      });
    }

    next();
  };
};

/**
 * Auth validation schemas
 */
const authValidation = {
  register: Joi.object({
    name: Joi.string().min(3).max(50).required()
      .messages({
        'string.min': 'Name must be at least 3 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string().min(6).required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      }),
    department: Joi.string().valid('IT', 'HR', 'Admin', 'Finance', 'Operations', 'Other')
      .default('Other')
      .messages({
        'any.only': 'Department must be one of: IT, HR, Admin, Finance, Operations, Other'
      })
  }),

  login: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string().required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  refresh: Joi.object({
    refreshToken: Joi.string().required()
      .messages({
        'any.required': 'Refresh token is required'
      })
  })
};

module.exports = {
  validate,
  authValidation
};