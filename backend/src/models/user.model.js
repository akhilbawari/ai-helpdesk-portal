const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * User schema for MongoDB
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['employee', 'support_agent', 'team_lead', 'admin'],
      default: 'employee',
    },
    department: {
      type: String,
      enum: ['IT', 'HR', 'Admin', 'Finance', 'Operations', 'Other'],
      default: 'Other',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Method to compare password with hashed password
 * @param {string} enteredPassword - The password to check
 * @returns {Promise<boolean>} True if password matches
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

/**
 * Pre-save middleware to hash password before saving
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('passwordHash')) {
    next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;