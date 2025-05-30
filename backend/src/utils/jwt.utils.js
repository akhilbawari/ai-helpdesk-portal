const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * Generate a JWT token
 * @param {Object} payload - Data to be encoded in the token
 * @param {string} secret - Secret key for signing
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate an access token
 * @param {Object} user - User object
 * @returns {string} Access token
 */
const generateAccessToken = (user) => {
  return generateToken(
    { 
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN
  );
};

/**
 * Generate a refresh token
 * @param {Object} user - User object
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
  return generateToken(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    process.env.JWT_REFRESH_EXPIRES_IN
  );
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key for verification
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};