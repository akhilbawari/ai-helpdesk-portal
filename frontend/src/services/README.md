# API Service Documentation

## Overview

The `apiService.js` file provides a centralized API handler for the AI Helpdesk Portal. It manages all API calls with proper role-based access control, standardized error handling, and consistent response formatting.

## Key Features

- **Centralized API Management**: All backend API endpoints are accessible through a single service
- **Role-Based Access Control**: Automatically checks user permissions before making API calls
- **Standardized Error Handling**: Consistent error handling across all API calls
- **Response Unwrapping**: Automatically unwraps the `ApiResponse<T>` format from the backend
- **Authentication Management**: Handles token storage, retrieval, and session expiration

## Usage

### Importing the Service

```javascript
// Import the service directly
import apiService from '../services/apiService';

// Or import from the services index
import { apiService } from '../services';
```

### Authentication

```javascript
// Register a new user
const registerResponse = await apiService.register({
  email: 'user@example.com',
  password: 'password123',
  fullName: 'John Doe'
});

// Login with email and password
const loginResponse = await apiService.login('user@example.com', 'password123');

// Login with Google OAuth
apiService.loginWithGoogle();

// Logout
apiService.logout();
```

### Ticket Management

```javascript
// Get all tickets (ADMIN, SUPPORT only)
const tickets = await apiService.getAllTickets();

// Get ticket by ID
const ticket = await apiService.getTicketById('ticket-123');

// Create a new ticket
const newTicket = await apiService.createTicket({
  title: 'Issue with login',
  description: 'I cannot log in to my account',
  priority: 'HIGH'
});

// Update a ticket
const updatedTicket = await apiService.updateTicket('ticket-123', {
  status: 'IN_PROGRESS'
});

// Assign a ticket to a user (ADMIN, SUPPORT only)
const assignedTicket = await apiService.assignTicket('ticket-123', 'user-456');

// Delete a ticket (ADMIN only)
await apiService.deleteTicket('ticket-123');
```

### Admin Functions

```javascript
// Get all users (ADMIN only)
const users = await apiService.getAllUsers();

// Update user role (ADMIN only)
const updatedUser = await apiService.updateUserRole('user-123', 'SUPPORT');

// Bulk import users (ADMIN only)
const importResult = await apiService.bulkImportUsers([
  { email: 'user1@example.com', fullName: 'User One', role: 'USER' },
  { email: 'user2@example.com', fullName: 'User Two', role: 'SUPPORT' }
]);

// Get user activities (ADMIN only)
const activities = await apiService.getUserActivities({
  userId: 'user-123',
  activityType: 'LOGIN',
  from: '2023-01-01',
  to: '2023-01-31'
});
```

### AI Services

```javascript
// Route a ticket (Public access)
const routingResult = await apiService.routeTicket(
  'Cannot access my account',
  'I tried to log in but it says my password is incorrect'
);

// Get response suggestions (ADMIN, SUPPORT only)
const suggestions = await apiService.suggestResponse(
  'Login issue',
  'I cannot log in to my account',
  ['Have you tried resetting your password?']
);

// Detect patterns (ADMIN only)
const patterns = await apiService.detectPatterns([
  { title: 'Login issue', description: 'Cannot log in' },
  { title: 'Password reset', description: 'Need to reset password' }
]);
```

### Dashboard

```javascript
// Get dashboard overview (ADMIN, SUPPORT only)
const overview = await apiService.getDashboardOverview();

// Get recent activity (ADMIN, SUPPORT only)
const recentActivity = await apiService.getRecentActivity(10);

// Get ticket patterns (ADMIN only)
const ticketPatterns = await apiService.getTicketPatterns(30);

// Get department performance (ADMIN, SUPPORT only)
const departmentPerformance = await apiService.getDepartmentPerformance();
```

## Error Handling

All API methods return a consistent response format:

```javascript
// Successful response
{
  data: { ... },  // The response data
  error: null     // No error
}

// Error response
{
  data: null,           // No data
  error: 'Error message',  // Error message
  statusCode: 400       // HTTP status code (optional)
}
```

Example of handling API responses:

```javascript
const { data, error } = await apiService.getTicketById('ticket-123');

if (error) {
  console.error('Error fetching ticket:', error);
  // Handle error (show message, etc.)
} else {
  // Use the data
  console.log('Ticket:', data);
}
```

## Role-Based Access

The service automatically checks if the user has the required role before making API calls. If the user doesn't have the required role, the API call will fail with an "Unauthorized" error.

## Migration Guide

If you're migrating from the individual service files to the centralized `apiService`, follow these steps:

1. Replace imports from individual services with `apiService`
2. Update method calls to use the corresponding methods in `apiService`
3. Update error handling to use the consistent response format

Example:

```javascript
// Before
import ticketService from '../services/ticketService';

async function fetchTicket(id) {
  try {
    const response = await ticketService.getTicketById(id);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// After
import { apiService } from '../services';

async function fetchTicket(id) {
  const { data, error } = await apiService.getTicketById(id);
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}
```
