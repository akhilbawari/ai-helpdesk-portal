const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
// These routes will be implemented later
// const ticketRoutes = require('./routes/ticket.routes');
// const kbRoutes = require('./routes/kb.routes');
// const aiRoutes = require('./routes/ai.routes');

// Import error handling middleware
const { errorHandler, notFound } = require('./middleware/error.middleware');

// Initialize Express app
const app = express();

// Connect to MongoDB - only if not connected in tests
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
app.use(helmet()); // Security headers

// CORS configuration - Allow all origins for development
app.use(cors());

app.use(express.json()); // Parse JSON request body
app.use(morgan('dev')); // Request logging

// Base API route
app.get('/api/v1', (req, res) => {
  res.json({ message: 'Welcome to the AI-First Internal Helpdesk Portal API' });
});

// Routes
app.use('/api/v1/auth', authRoutes);
// These routes will be implemented later
// app.use('/api/v1/tickets', ticketRoutes);
// app.use('/api/v1/kb', kbRoutes);
// app.use('/api/v1/ai', aiRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  
  // Close server & exit process (except in test environment)
  if (process.env.NODE_ENV !== 'test') {
    server.close(() => process.exit(1));
  }
});

module.exports = server; // For testing