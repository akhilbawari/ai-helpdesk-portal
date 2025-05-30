const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';

let mongod;

/**
 * Connect to the in-memory database before tests run
 */
const setup = async () => {
  // Close existing connection if any
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  await mongoose.connect(uri, mongooseOpts);
};

/**
 * Drop database, close the connection and stop mongod
 */
const teardown = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

/**
 * Remove all the data for all db collections
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};

// Set up before running tests
beforeAll(async () => {
  jest.setTimeout(30000); // Increase timeout for MongoDB operations
  await setup();
});

// Clean up after tests
afterAll(async () => {
  await teardown();
});

// Clear the database after each test
afterEach(async () => {
  await clearDatabase();
});

module.exports = {
  setup,
  teardown,
  clearDatabase
};