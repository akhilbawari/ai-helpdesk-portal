const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, getProfile } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, authValidation } = require('../middleware/validation.middleware');

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validate(authValidation.register), register);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post('/login', validate(authValidation.login), login);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', validate(authValidation.refresh), refreshToken);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user and clear token
 * @access Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route GET /api/v1/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authenticate, getProfile);

module.exports = router;