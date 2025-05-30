const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { verifyToken } = require('../utils/jwt.utils');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 * Verifies JWT token in Authorization header
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    
    if (!decoded) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('User not found or deactivated');
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    next(error);
  }
};

/**
 * Role-based authorization middleware
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    // Must be authenticated first
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authenticated'));
    }
    
    // Check if user's role is in the allowed roles
    if (roles.length && !roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('Forbidden - Insufficient permissions'));
    }
    
    next();
  };
};

module.exports = { authenticate, authorize };