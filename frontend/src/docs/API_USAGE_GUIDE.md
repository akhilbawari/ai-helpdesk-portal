# API Usage Guide: Role-Based Implementation

## Overview

This document provides a comprehensive analysis of the centralized API service usage across the frontend application. It outlines which components are using each API, the required user roles for each API, and recommendations for proper role-based implementation.

## API Usage Status

### Authentication APIs

| API Method | Current Usage | Required Roles | Status |
|------------|---------------|----------------|--------|
| `register` | Login/Register pages | PUBLIC | ✅ Properly implemented |
| `login` | Login page | PUBLIC | ✅ Properly implemented |
| `loginWithGoogle` | Login/Register pages | PUBLIC | ✅ Properly implemented |
| `logout` | Header component | ANY | ✅ Properly implemented |
| `getCurrentUser` | Auth context | ANY | ✅ Properly implemented |

### Ticket APIs

| API Method | Current Usage | Required Roles | Status |
|------------|---------------|----------------|--------|
| `getAllTickets` | TicketList page | ADMIN, SUPPORT | ✅ Properly implemented |
| `getTicketsByDepartment` | SupportDashboard | SUPPORT | ✅ Properly implemented |
| `getTicketsByUser` | EmployeeDashboard | ANY | ✅ Properly implemented |
| `getTicketById` | TicketDetail page | ANY (with ownership check) | ✅ Properly implemented |
| `createTicket` | CreateTicket page | ANY | ✅ Properly implemented |
| `updateTicket` | TicketDetail page | ANY (with ownership check) | ✅ Properly implemented |
| `deleteTicket` | TicketList page (admin) | ADMIN | ✅ Properly implemented |
| `assignTicket` | TicketDetail page | ADMIN, SUPPORT | ✅ Properly implemented |

### AI Service APIs

| API Method | Current Usage | Required Roles | Status |
|------------|---------------|----------------|--------|
| `routeTicket` | CreateTicket page | ANY | ✅ Properly implemented |
| `suggestResponse` | TicketDetail page | ADMIN, SUPPORT | ✅ Updated to use apiService |
| `detectPatterns` | AdminDashboard | ADMIN | ❌ Not implemented yet |

### Admin APIs

| API Method | Current Usage | Required Roles | Status |
|------------|---------------|----------------|--------|
| `getAllUsers` | UserManagement page | ADMIN | ✅ Properly implemented |
| `getUserById` | UserManagement page | ADMIN | ✅ Properly implemented |
| `updateUserRole` | UserManagement page | ADMIN | ✅ Properly implemented |
| `deleteUser` | UserManagement page | ADMIN | ✅ Properly implemented |
| `importUsersFromCsv` | UserManagement page | ADMIN | ✅ Properly implemented |
| `getUserActivityLogs` | UserActivityMonitoring page | ADMIN | ✅ Properly implemented |

### Dashboard APIs

| API Method | Current Usage | Required Roles | Status |
|------------|---------------|----------------|--------|
| `getDashboardOverview` | AdminDashboard | ADMIN | ✅ Properly implemented |
| `getTicketsByStatus` | Dashboard components | ADMIN, SUPPORT | ✅ Properly implemented |
| `getTicketsByPriority` | Dashboard components | ADMIN, SUPPORT | ✅ Properly implemented |
| `getRecentActivity` | Dashboard components | ADMIN, SUPPORT | ✅ Properly implemented |
| `getDepartmentPerformance` | AdminDashboard | ADMIN | ✅ Properly implemented |
| `getAIPatterns` | AdminDashboard | ADMIN | ✅ Properly implemented |

## Implementation Status

### Completed Implementations

- ✅ Updated `TicketDetail.jsx` to use the centralized `apiService` for all ticket operations including responses, attachments, and AI suggestions
- ✅ Updated `TicketList.jsx` to use the centralized `apiService` for fetching tickets with proper role-based filtering
- ✅ Updated `CreateTicket.jsx` to use the centralized `apiService` for ticket creation and AI routing
- ✅ Added UI-level role protection for ticket management operations
- ✅ Updated `AdminDashboard.jsx` to use centralized `apiService` methods with role checks
- ✅ Updated `SupportDashboard.jsx` to use centralized `apiService` methods with role checks
- ✅ Updated `EmployeeDashboard.jsx` to use centralized `apiService` methods with role checks
- ✅ Updated `AuthContext.jsx` to use centralized `apiService` for authentication operations
- ✅ Updated `Login.jsx` to use centralized `apiService` for Google login
- ✅ Updated `Register.jsx` to use centralized `apiService` for Google login
- ✅ Updated `NotificationProvider.jsx` to use centralized `apiService` for WebSocket operations
- ✅ Updated `UserManagement.jsx` to use centralized `apiService` for all admin user operations
- ✅ Updated `UserActivityMonitoring.jsx` to use centralized `apiService` for user activity logs
- ✅ Updated `KnowledgeList.jsx` to use centralized `apiService` for knowledge base operations
- ✅ Updated `KnowledgeDetail.jsx` to use centralized `apiService` for document viewing and related documents
- ✅ Updated `KnowledgeForm.jsx` to use centralized `apiService` for document creation and editing

### Pending Implementations

All major components have been updated to use the centralized `apiService`. The following tasks remain:

1. **Unit Testing**
   - Create tests for role-based access control
   - Verify error handling for unauthorized access

2. **Integration Testing**
   - Test all components with different user roles
   - Verify proper error messages are displayed

## Implementation Guidelines

### 1. Replace Service Imports

```javascript
// Before
import { ticketService, authService, adminService } from '../../services';

// After
import { apiService } from '../../services';
```

### 2. Update API Calls

```javascript
// Before
const { data, error } = await ticketService.getAllTickets();

// After
const { data, error } = await apiService.getAllTickets();
```

### 3. Add UI-Level Role Protection

```jsx
// Before
<button onClick={handleDeleteUser}>Delete User</button>

// After
{profile?.role === 'ADMIN' && (
  <button onClick={handleDeleteUser}>Delete User</button>
)}
```

### 4. Handle Unauthorized Access

```javascript
// The apiService will automatically handle unauthorized access,
// but components should be prepared to handle the error response
try {
  const { data, error } = await apiService.adminOnlyFunction();
  if (error) {
    // Handle error appropriately
    if (error.statusCode === 403) {
      // Show unauthorized access message
    }
  }
} catch (err) {
  // Handle unexpected errors
}
```

## Next Steps

1. **Comprehensive Testing**: Create a test plan to verify all role-based access controls
2. **Documentation Updates**: Update API documentation to reflect all implemented role checks
3. **Error Handling Review**: Ensure consistent error handling across all components
4. **Performance Optimization**: Review API calls for potential optimization opportunities
5. **Add Unit Tests**: Create tests to verify role-based access control is working correctly

## Conclusion

Implementing proper role-based access control through the centralized `apiService` will significantly improve the security and maintainability of the application. By following this guide, all frontend components will consistently enforce the same access control rules that are defined in the backend.
