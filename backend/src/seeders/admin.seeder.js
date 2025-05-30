const mongoose = require('mongoose');
const User = require('../models/user.model');
const logger = require('../utils/logger');
require('dotenv').config();

/**
 * Seed admin user to database
 */
const seedAdmin = async () => {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.info('MongoDB connected for seeding');
    }

    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      logger.info('Admin user already exists, skipping seed');
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'admin123',  // Will be hashed by the pre-save hook
      role: 'admin',
      department: 'IT',
      isActive: true
    });

    logger.info(`Admin user created: ${admin.email}`);
  } catch (error) {
    logger.error(`Error seeding admin user: ${error.message}`);
  } finally {
    // Only disconnect if this script was run directly
    if (require.main === module) {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected after seeding');
    }
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  seedAdmin().then(() => {
    process.exit(0);
  });
}

module.exports = seedAdmin;