const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../src/models/user.model');
let server;

describe('Auth Routes', () => {
  beforeEach(() => {
    server = require('../../src/server');
  });

  afterEach(async () => {
    await server.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        department: 'IT'
      };

      const res = await request(server)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.name).toBe(userData.name);
      expect(res.body.data.email).toBe(userData.email);
      expect(res.body.data.role).toBe('employee'); // Default role
      expect(res.body.data.department).toBe(userData.department);
    });

    it('should not register a user with an existing email', async () => {
      // Create a user first
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        passwordHash: 'password123',
        department: 'IT'
      });

      // Try to register with the same email
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        department: 'IT'
      };

      const res = await request(server)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login a user and return tokens', async () => {
      // Create a user first
      const user = new User({
        name: 'Login Test User',
        email: 'login@example.com',
        passwordHash: 'password123',
        department: 'HR'
      });
      await user.save();

      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      };

      const res = await request(server)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.email).toBe(loginData.email);
    });

    it('should not login with incorrect password', async () => {
      // Create a user first
      const user = new User({
        name: 'Password Test User',
        email: 'password@example.com',
        passwordHash: 'password123',
        department: 'HR'
      });
      await user.save();

      const loginData = {
        email: 'password@example.com',
        password: 'wrongpassword'
      };

      const res = await request(server)
        .post('/api/v1/auth/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should get user profile when authenticated', async () => {
      // Create a user first
      const user = new User({
        name: 'Profile Test User',
        email: 'profile@example.com',
        passwordHash: 'password123',
        department: 'Admin'
      });
      await user.save();

      // Login to get token
      const loginRes = await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'profile@example.com',
          password: 'password123'
        });

      const token = loginRes.body.data.accessToken;

      // Get profile with token
      const res = await request(server)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.email).toBe('profile@example.com');
      expect(res.body.data.name).toBe('Profile Test User');
    });

    it('should not get profile without token', async () => {
      const res = await request(server).get('/api/v1/auth/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Create a user and get tokens
      const registerRes = await request(server)
        .post('/api/v1/auth/register')
        .send({
          name: 'Refresh Test User',
          email: 'refresh@example.com',
          password: 'password123',
          department: 'Finance'
        });

      const refreshToken = registerRes.body.data.refreshToken;

      // Wait a brief moment to ensure tokens are different
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Request new tokens
      const res = await request(server)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      // New refresh token should be different
      expect(res.body.data.refreshToken).not.toBe(refreshToken);
    });

    it('should not refresh with invalid token', async () => {
      const res = await request(server)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout a user and clear refresh token', async () => {
      // Create a user first
      const user = new User({
        name: 'Logout Test User',
        email: 'logout@example.com',
        passwordHash: 'password123',
        department: 'Operations'
      });
      await user.save();

      // Login to get token
      const loginRes = await request(server)
        .post('/api/v1/auth/login')
        .send({
          email: 'logout@example.com',
          password: 'password123'
        });

      const token = loginRes.body.data.accessToken;

      // Logout with token
      const res = await request(server)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');

      // Verify refresh token was cleared
      const userAfter = await User.findOne({ email: 'logout@example.com' });
      expect(userAfter.refreshToken).toBeNull();
    });

    it('should not logout without authentication', async () => {
      const res = await request(server).post('/api/v1/auth/logout');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});