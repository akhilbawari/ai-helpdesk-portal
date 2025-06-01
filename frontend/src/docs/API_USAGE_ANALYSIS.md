# API Usage Analysis & Role-Based Implementation

## Overview

This document analyzes the current usage of APIs in the frontend components and provides recommendations for implementing proper role-based access control using the centralized `apiService.js`.

## Current API Usage Analysis

### Authentication Components

The authentication components have been updated to use the centralized `apiService` for all authentication operations:

1. **Login.jsx and Register.jsx**: 
   - Updated to use `apiService.loginWithGoogle()` for Google authentication
   - Previously used direct import of `authService`

2. **AuthContext.jsx**:
   - Updated to use centralized `apiService` methods for all authentication operations
   - Includes proper error handling for unauthorized access

### Ticket Management Components

All ticket management components have been updated to use the centralized `apiService`:

1. **TicketList.jsx**:
   - Updated to use `apiService` methods for fetching tickets with proper role-based filtering
   - Added error handling for unauthorized access with toast notifications
   - Implemented role-based access control for different ticket listing methods

2. **CreateTicket.jsx**:
   - Updated to use `apiService` for ticket creation, user fetching, and AI routing
   - Added proper error handling with status code checks
   - Implemented role-based access control for support user fetching

3. **TicketDetail.jsx**:
   - Fully updated to use `apiService` for all operations including:
     - Ticket fetching with ownership checks
     - Response management with internal note handling
     - Attachment uploads and downloads
     - Ticket status updates and assignment
     - AI response suggestions
   - Added comprehensive error handling with appropriate user feedback
   - Implemented UI-level role protection for admin/support-only features

### Notification System

The notification system has been updated to use the centralized `apiService` for WebSocket connections:

1. **NotificationProvider.jsx**:
   - Updated to use `apiService` methods for WebSocket connections and subscriptions
   - Previously used separate `websocketService`
   - Includes proper role-based subscriptions based on user role

### Dashboard Components

All dashboard components have been updated to use the centralized `apiService`:

1. **AdminDashboard.jsx**:
   - Updated to use `apiService` methods with role checks
   - Added error handling for unauthorized access

2. **SupportDashboard.jsx**:
   - Updated to use `apiService.getTicketsByDepartment()` with role checks
   - Added error handling for unauthorized access

3. **EmployeeDashboard.jsx**:
   - Updated to use `apiService.getMyTickets()` for fetching user-specific tickets
   - Added error handling for permission issues

### Admin Components

All admin components have been updated to use the centralized `apiService`:

1. **UserManagement.jsx**:
   - Successfully migrated from `adminService` to `apiService` for all user management operations
   - Implemented proper role checks with consistent error handling
   - Updated methods: `getAllUsers`, `updateUserRole`, `deleteUser`, `importUsersFromCsv`
   - Added toast notifications for permission issues and operation results

2. **UserActivityMonitoring.jsx**:
   - Successfully migrated from `adminService` to `apiService` for fetching user activity logs
   - Implemented proper role checks with error handling
   - Updated to use `apiService.getUserActivities()` and `apiService.getAllUserActivities()`
   - Added toast notifications for permission issues
   - Added error handling for unauthorized access

3. **EmployeeDashboard.jsx**:
   - Updated to use `apiService.getMyTickets()` for fetching user-specific tickets
   - Added error handling for permission issues

### Knowledge Base Components

All knowledge base components have been updated to use the centralized `apiService`:

1. **KnowledgeList.jsx**:
   - Successfully migrated from `knowledgeService` to `apiService` for fetching knowledge documents
   - Implemented proper role checks with error handling
   - Updated to use `apiService.getAllKnowledgeDocuments()` and `apiService.getKnowledgeDocumentById()`
   - Added toast notifications for permission issues
   - Added error handling for unauthorized access

2. **KnowledgeDetail.jsx**:
   - Successfully migrated from `knowledgeService` to `apiService` for fetching knowledge documents
   - Implemented proper role checks with error handling
   - Updated to use `apiService.getKnowledgeDocumentById()` and `apiService.getRelatedDocumentsByTag()`
   - Added toast notifications for permission issues
   - Added error handling for unauthorized access

3. **KnowledgeForm.jsx**:
   - Successfully migrated from `knowledgeService` to `apiService` for creating and updating knowledge documents
   - Implemented proper role checks with error handling
   - Updated to use `apiService.createKnowledgeDocument()` and `apiService.updateKnowledgeDocument()`
   - Added toast notifications for permission issues and operation results

### AI Response Suggestion API

The `suggestResponse` API is designed for ADMIN and SUPPORT roles only, but the current implementation has the following issues:

1. **Current Implementation**: 
   - Located in: `/pages/tickets/TicketDetail.jsx`
   - Uses the old `aiService.suggestResponse()` method
   - No explicit role checking before making the API call

2. **Issues**:
   - Uses deprecated individual service instead of the centralized `apiService`
   - Lacks proper role-based access control at the component level
   - Could potentially be accessed by unauthorized users if the UI elements are exposed

## Required Changes

### 1. Update TicketDetail.jsx

Replace the current `aiService.suggestResponse()` call with the centralized `apiService.suggestResponse()` method that includes built-in role checking:

```javascript
// Current implementation
const { data, error } = await aiService.suggestResponse(
  ticket.title,
  ticket.description,
  previousResponses
);

// Should be replaced with
const { data, error } = await apiService.suggestResponse(
  ticket.title,
  ticket.description,
  previousResponses
);
```

### 2. Update Import Statement

Replace the import of individual services with the centralized apiService:

```javascript
// Current import
import { ticketService, ticketResponseService, profileService, attachmentService, aiService } from '../../services';

// Should be replaced with
import { ticketService, ticketResponseService, profileService, attachmentService, apiService } from '../../services';
```

### 3. Add UI-Level Role Protection

Even though the `apiService.suggestResponse()` method includes role checking, it's best practice to also hide UI elements from unauthorized users:

```jsx
{/* Only show AI suggestion button for ADMIN and SUPPORT roles */}
{(profile?.role === 'ADMIN' || profile?.role === 'SUPPORT') && (
  <button
    onClick={handleGetAiSuggestions}
    disabled={loadingSuggestions}
    className="bg-navy-500 hover:bg-navy-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 ml-2"
  >
    {loadingSuggestions ? 'Getting Suggestions...' : 'Get AI Suggestions'}
  </button>
)}
```

## Complete API Usage Analysis

| API Method | File | Current Service | Should Use | Allowed Roles | UI Protection |
|------------|------|----------------|------------|---------------|--------------|
| getAllTickets | /pages/tickets/TicketList.jsx | apiService | apiService | ADMIN | ✅ Complete |
| getTicketsByCategory | /pages/tickets/TicketList.jsx | apiService | apiService | ADMIN, SUPPORT | ✅ Complete |
| getTicketsByStatus | /pages/tickets/TicketList.jsx | apiService | apiService | ADMIN, SUPPORT | ✅ Complete |
| getTicketsByCategoryAndStatus | /pages/tickets/TicketList.jsx | apiService | apiService | ADMIN, SUPPORT | ✅ Complete |
| getMyTickets | /pages/tickets/TicketList.jsx | apiService | apiService | ANY | ✅ Complete |
| createTicket | /pages/tickets/CreateTicket.jsx | apiService | apiService | ANY | ✅ Complete |
| uploadAttachment | /pages/tickets/CreateTicket.jsx | apiService | apiService | ANY | ✅ Complete |
| routeTicket | /pages/tickets/CreateTicket.jsx | apiService | apiService | ANY | ✅ Complete |
| getAllUsers | /pages/tickets/CreateTicket.jsx | apiService | apiService | ADMIN, SUPPORT | ✅ Complete |
| getTicketById | /pages/tickets/TicketDetail.jsx | apiService | apiService | ANY (with ownership) | ✅ Complete |
| getResponsesByTicket | /pages/tickets/TicketDetail.jsx | apiService | apiService | ADMIN, SUPPORT | ✅ Complete |
| getPublicResponsesByTicket | /pages/tickets/TicketDetail.jsx | apiService | apiService | ANY | ✅ Complete |
| getAttachmentsByTicket | /pages/tickets/TicketDetail.jsx | apiService | apiService | ANY (with ownership) | ✅ Complete |
| getUsersByRole | /pages/tickets/TicketDetail.jsx | apiService | apiService | ADMIN, SUPPORT | ✅ Complete |
| createTicketResponse | /pages/tickets/TicketDetail.jsx | apiService | apiService | ANY (with ownership) | ✅ Complete |
| updateTicket | /pages/tickets/TicketDetail.jsx | apiService | apiService | ADMIN, SUPPORT, OWNER | ✅ Complete |
| assignTicket | /pages/tickets/TicketDetail.jsx | apiService | apiService | ADMIN, SUPPORT | ✅ Complete |
| downloadAttachment | /pages/tickets/TicketDetail.jsx | apiService | apiService | ANY (with ownership) | ✅ Complete |
| suggestResponse | /pages/tickets/TicketDetail.jsx | apiService | apiService | ADMIN, SUPPORT | ✅ Complete |
| login | /pages/auth/Login.jsx | apiService | apiService | PUBLIC | ✅ N/A |
| register | /pages/auth/Register.jsx | apiService | apiService | PUBLIC | ✅ N/A |
| loginWithGoogle | /pages/auth/Login.jsx, /pages/auth/Register.jsx | apiService | apiService | PUBLIC | ✅ N/A |
| logout | /context/AuthContext.jsx | apiService | apiService | ANY | ✅ N/A |
| getCurrentUserProfile | /context/AuthContext.jsx | apiService | apiService | ANY | ✅ N/A |
| getDashboardOverview | /pages/dashboard/AdminDashboard.jsx | apiService | apiService | ADMIN | ✅ Complete |
| getAllTickets | /pages/dashboard/AdminDashboard.jsx | apiService | apiService | ADMIN | ✅ Complete |
| getTicketsByDepartment | /pages/dashboard/SupportDashboard.jsx | apiService | apiService | SUPPORT | ✅ Complete |
| getMyTickets | /pages/dashboard/EmployeeDashboard.jsx | apiService | apiService | ANY | ✅ Complete |
| getAllUsers | /pages/dashboard/AdminDashboard.jsx | apiService | apiService | ADMIN | ✅ Complete |
| detectPatterns | /pages/dashboard/AdminDashboard.jsx | apiService | apiService | ADMIN | ✅ Complete |

## API Integration Status

All major APIs from the centralized `apiService.js` are now being used in their respective frontend components:

1. **Admin APIs**:
   - All admin APIs are now properly integrated in their respective components:
     - `getAllUsers` - Used in UserManagement.jsx
     - `updateUserRole` - Used in UserManagement.jsx
     - `deleteUser` - Used in UserManagement.jsx
     - `importUsersFromCsv` - Used in UserManagement.jsx
     - `getUserActivityLogs` - Used in UserActivityMonitoring.jsx

2. **Knowledge Base APIs**:
   - All knowledge base APIs are now properly integrated with the centralized `apiService`:
     - `getAllKnowledgeDocuments` - Used in KnowledgeList.jsx
     - `getKnowledgeDocumentById` - Used in KnowledgeDetail.jsx and KnowledgeForm.jsx
     - `createKnowledgeDocument` - Used in KnowledgeForm.jsx
     - `updateKnowledgeDocument` - Used in KnowledgeForm.jsx
     - `deleteKnowledgeDocument` - Used in KnowledgeList.jsx and KnowledgeDetail.jsx
     - `getRelatedDocumentsByTag` - Used in KnowledgeDetail.jsx

## Recommendations

1. **Complete Migration**: Fully migrate from individual service imports to the centralized `apiService` for consistent role-based access control.

2. **UI Protection**: Add role-based UI protection to hide elements that trigger API calls restricted to certain roles.

3. **Error Handling**: Implement consistent error handling for unauthorized access attempts, showing appropriate messages when a user tries to access functionality they don't have permission for.

4. **Documentation**: Keep this document updated as new API endpoints are added or existing ones are modified.

## Next Steps

1. ✅ Update the `TicketDetail.jsx` component to use the centralized `apiService` for all operations.
2. ✅ Update `TicketList.jsx` to use the centralized `apiService` for ticket fetching.
3. ✅ Update `CreateTicket.jsx` to use the centralized `apiService` for ticket creation.
4. ✅ Update authentication components to use the centralized `apiService`.
5. ✅ Update dashboard components to use the centralized `apiService` with proper role checks.
6. ✅ Update notification system to use the centralized `apiService` for WebSocket operations.
7. ✅ Successfully updated all Admin components:
   - UserManagement.jsx - Fully migrated to use centralized `apiService`
   - UserActivityMonitoring.jsx - Fully migrated to use centralized `apiService`
8. ✅ Successfully updated all Knowledge Base components:
   - KnowledgeList.jsx - Fully migrated to use centralized `apiService`
   - KnowledgeDetail.jsx - Fully migrated to use centralized `apiService`
   - KnowledgeForm.jsx - Fully migrated to use centralized `apiService`
9. Add UI-level role protection for all remaining restricted functionality.
10. Implement comprehensive testing for role-based access control.
11. Review error handling consistency across all components.
12. Optimize API calls for performance where possible.
