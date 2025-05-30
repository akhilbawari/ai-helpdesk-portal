const mongoose = require('mongoose');
const User = require('../models/user.model');
const logger = require('../utils/logger');
require('dotenv').config();

/**
 * Seed users with various roles to database
 */
const seedUsers = async () => {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.info('MongoDB connected for seeding users');
    }

    // Sample users to seed
    const users = [
      {
        name: 'Employee One',
        email: 'employee@example.com',
        passwordHash: 'password123',
        role: 'employee',
        department: 'Finance',
      },
      {
        name: 'Support Agent',
        email: 'agent@example.com',
        passwordHash: 'password123',
        role: 'support_agent',
        department: 'IT',
      },
      {
        name: 'Team Lead',
        email: 'lead@example.com',
        passwordHash: 'password123',
        role: 'team_lead',
        department: 'HR',
      },
    ];

    // Check if users already exist
    const existingCount = await User.countDocuments({
      email: { $in: users.map(user => user.email) }
    });

    if (existingCount === users.length) {
      logger.info('Sample users already exist, skipping seed');
      return;
    }

    // Create users
    const createdUsers = await Promise.all(
      users.map(async (userData) => {
        // Check if user exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          logger.info(`User ${userData.email} already exists, skipping`);
          return existingUser;
        }
        
        // Create user
        const user = await User.create({
          ...userData,
          isActive: true
        });
        
        logger.info(`User created: ${user.email} (${user.role})`);
        return user;
      })
    );

    logger.info(`Seeded ${createdUsers.length} users`);
  } catch (error) {
    logger.error(`Error seeding users: ${error.message}`);
  } finally {
    // Only disconnect if this script was run directly
    if (require.main === module) {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected after seeding users');
    }
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  seedUsers().then(() => {
    process.exit(0);
  });
}

module.exports = seedUsers;