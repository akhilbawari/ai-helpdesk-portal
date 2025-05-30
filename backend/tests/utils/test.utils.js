const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/user.model');

/**
 * Create a test user with the specified role
 * @param {string} role - User role
 * @returns {Promise<Object>} User object with tokens
 */
const createTestUser = async (role = 'employee') => {
  const userData = {
    name: `Test ${role}`,
    email: `test_${role}_${Date.now()}@example.com`,
    passwordHash: 'password123',
    role,
    department: 'IT',
    isActive: true
  };

  const user = await User.create(userData);
  
  // Generate tokens
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'test_jwt_secret',
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'test_refresh_secret',
    { expiresIn: '7d' }
  );
  
  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save();
  
  return {
    user,
    accessToken,
    refreshToken
  };
};

/**
 * Remove all users from the database
 * @returns {Promise<void>}
 */
const removeAllUsers = async () => {
  await User.deleteMany({});
};

/**
 * Generate a MongoDB ObjectId
 * @returns {string} ObjectId string
 */
const generateObjectId = () => {
  return new mongoose.Types.ObjectId().toString();
};

module.exports = {
  createTestUser,
  removeAllUsers,
  generateObjectId
};