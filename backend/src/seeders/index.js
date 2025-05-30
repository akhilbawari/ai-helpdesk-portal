const mongoose = require('mongoose');
const logger = require('../utils/logger');
require('dotenv').config();

// Import seeders
const seedAdmin = require('./admin.seeder');
const seedUsers = require('./users.seeder');

/**
 * Run all seeders
 */
const runSeeders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected for seeding');

    // Run seeders in sequence
    logger.info('Starting database seeding...');
    
    // Admin user first
    await seedAdmin();
    
    // Other users
    await seedUsers();
    
    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error(`Error during seeding: ${error.message}`);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('MongoDB disconnected after seeding');
  }
};

// Run seeders if this script is executed directly
if (require.main === module) {
  runSeeders().then(() => {
    process.exit(0);
  });
}

module.exports = runSeeders;