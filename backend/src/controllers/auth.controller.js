const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt.utils');
const logger = require('../utils/logger');

/**
 * User registration
 * @route POST /api/v1/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      department,
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid user data');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
};

/**
 * User login
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      res.status(401);
      throw new Error('Account is deactivated');
    }

    // Update last login
    user.lastLogin = Date.now();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

/**
 * Refresh access token
 * @route POST /api/v1/auth/refresh
 * @access Public
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400);
      throw new Error('Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (!decoded) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }

    // Find user by id and check if refresh token matches
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken,
      isActive: true,
    });

    if (!user) {
      res.status(401);
      throw new Error('Invalid refresh token or user not found');
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    next(error);
  }
};

/**
 * User logout
 * @route POST /api/v1/auth/logout
 * @access Private
 */
const logout = async (req, res, next) => {
  try {
    // Clear refresh token in database
    const user = req.user;
    user.refreshToken = null;
    await user.save();

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/v1/auth/profile
 * @access Private
 */
const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
};