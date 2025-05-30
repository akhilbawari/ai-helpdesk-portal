#!/usr/bin/env node
/**
 * Admin CLI tool for AI-First Internal Helpdesk Portal
 * Allows managing users and performing admin actions via command line
 */
const mongoose = require('mongoose');
const readline = require('readline');
const dotenv = require('dotenv');
const User = require('../models/user.model');
const logger = require('../utils/logger');

// Load environment variables
dotenv.config();

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected for admin operations');
    return true;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

// Prompt user for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// List all users
const listUsers = async () => {
  try {
    const users = await User.find({}).select('-passwordHash -refreshToken');
    
    console.log('\n===== USER LIST =====');
    console.table(
      users.map(user => ({
        ID: user._id.toString(),
        Name: user.name,
        Email: user.email,
        Role: user.role,
        Department: user.department,
        Status: user.isActive ? 'Active' : 'Inactive',
        Created: user.createdAt.toISOString().split('T')[0]
      }))
    );
  } catch (error) {
    logger.error(`Error listing users: ${error.message}`);
  }
};

// Create new user
const createUser = async () => {
  try {
    console.log('\n===== CREATE USER =====');
    
    const name = await prompt('Enter name: ');
    const email = await prompt('Enter email: ');
    const password = await prompt('Enter password: ');
    const role = await prompt('Enter role (employee, support_agent, team_lead, admin): ');
    const department = await prompt('Enter department (IT, HR, Admin, Finance, Operations, Other): ');
    
    // Validate input
    if (!name || !email || !password) {
      logger.error('Name, email, and password are required');
      return;
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.error(`User with email ${email} already exists`);
      return;
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role: ['employee', 'support_agent', 'team_lead', 'admin'].includes(role) ? role : 'employee',
      department: ['IT', 'HR', 'Admin', 'Finance', 'Operations', 'Other'].includes(department) ? department : 'Other',
      isActive: true
    });
    
    logger.info(`User created: ${user.email} (${user.role})`);
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
  }
};

// Change user role
const changeRole = async () => {
  try {
    console.log('\n===== CHANGE USER ROLE =====');
    
    // List users first
    await listUsers();
    
    const email = await prompt('Enter user email: ');
    const newRole = await prompt('Enter new role (employee, support_agent, team_lead, admin): ');
    
    // Validate input
    if (!['employee', 'support_agent', 'team_lead', 'admin'].includes(newRole)) {
      logger.error('Invalid role. Must be one of: employee, support_agent, team_lead, admin');
      return;
    }
    
    // Find and update user
    const user = await User.findOne({ email });
    if (!user) {
      logger.error(`User with email ${email} not found`);
      return;
    }
    
    user.role = newRole;
    await user.save();
    
    logger.info(`User ${email} role changed to ${newRole}`);
  } catch (error) {
    logger.error(`Error changing role: ${error.message}`);
  }
};

// Activate/deactivate user
const toggleUserStatus = async () => {
  try {
    console.log('\n===== TOGGLE USER STATUS =====');
    
    // List users first
    await listUsers();
    
    const email = await prompt('Enter user email: ');
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      logger.error(`User with email ${email} not found`);
      return;
    }
    
    // Toggle status
    user.isActive = !user.isActive;
    await user.save();
    
    logger.info(`User ${email} ${user.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    logger.error(`Error toggling user status: ${error.message}`);
  }
};

// Reset user password
const resetPassword = async () => {
  try {
    console.log('\n===== RESET USER PASSWORD =====');
    
    const email = await prompt('Enter user email: ');
    const newPassword = await prompt('Enter new password: ');
    
    // Validate input
    if (!newPassword) {
      logger.error('Password cannot be empty');
      return;
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      logger.error(`User with email ${email} not found`);
      return;
    }
    
    // Update password
    user.passwordHash = newPassword;
    await user.save();
    
    logger.info(`Password reset for user ${email}`);
  } catch (error) {
    logger.error(`Error resetting password: ${error.message}`);
  }
};

// Main menu
const showMenu = async () => {
  console.log('\n===== ADMIN MENU =====');
  console.log('1. List all users');
  console.log('2. Create new user');
  console.log('3. Change user role');
  console.log('4. Activate/deactivate user');
  console.log('5. Reset user password');
  console.log('0. Exit');
  
  const choice = await prompt('\nEnter your choice: ');
  
  switch (choice) {
    case '1':
      await listUsers();
      break;
    case '2':
      await createUser();
      break;
    case '3':
      await changeRole();
      break;
    case '4':
      await toggleUserStatus();
      break;
    case '5':
      await resetPassword();
      break;
    case '0':
      logger.info('Exiting admin tool');
      rl.close();
      mongoose.disconnect();
      process.exit(0);
      break;
    default:
      logger.warn('Invalid choice');
  }
  
  // Return to menu after operation
  if (choice !== '0') {
    await showMenu();
  }
};

// Main function
const main = async () => {
  console.log('===== AI-FIRST INTERNAL HELPDESK PORTAL =====');
  console.log('===== ADMIN TOOL =====\n');
  
  const connected = await connectDB();
  if (!connected) {
    logger.error('Failed to connect to database. Exiting...');
    rl.close();
    process.exit(1);
  }
  
  await showMenu();
};

// Run main function
main().catch(error => {
  logger.error(`Unhandled error: ${error.message}`);
  rl.close();
  mongoose.disconnect();
  process.exit(1);
});