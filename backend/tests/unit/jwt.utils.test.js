const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../../src/utils/jwt.utils');

// Mock environment variables
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Mock user object
const mockUser = {
  _id: '60d0fe4f5311236168a109ca',
  name: 'Test User',
  email: 'test@example.com',
  role: 'employee'
};

describe('JWT Utilities', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(mockUser);
      
      // Verify token is a string
      expect(typeof token).toBe('string');
      
      // Decode and verify content
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id', mockUser._id);
      expect(decoded).toHaveProperty('name', mockUser.name);
      expect(decoded).toHaveProperty('email', mockUser.email);
      expect(decoded).toHaveProperty('role', mockUser.role);
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(mockUser);
      
      // Verify token is a string
      expect(typeof token).toBe('string');
      
      // Decode and verify content
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      expect(decoded).toHaveProperty('id', mockUser._id);
      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
      
      // Refresh token should not contain user details
      expect(decoded).not.toHaveProperty('name');
      expect(decoded).not.toHaveProperty('email');
      expect(decoded).not.toHaveProperty('role');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      // Generate a token first
      const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET);
      
      // Verify the token
      const decoded = verifyToken(token, process.env.JWT_SECRET);
      
      // Check the decoded token has the expected properties
      expect(decoded).toHaveProperty('id', mockUser._id);
      expect(decoded).toHaveProperty('iat');
    });

    it('should return null for an invalid token', () => {
      const invalidToken = 'invalid.token.string';
      
      // Try to verify invalid token
      const result = verifyToken(invalidToken, process.env.JWT_SECRET);
      
      // Should return null
      expect(result).toBeNull();
    });

    it('should return null for an expired token', () => {
      // Generate a token with a past expiration date
      const expiredToken = jwt.sign(
        { id: mockUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' } // Already expired
      );
      
      // Try to verify expired token
      const result = verifyToken(expiredToken, process.env.JWT_SECRET);
      
      // Should return null
      expect(result).toBeNull();
    });
  });
});