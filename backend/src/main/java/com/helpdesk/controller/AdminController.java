package com.helpdesk.controller;

import com.helpdesk.config.RequireRole;
import com.helpdesk.model.Profile;
import com.helpdesk.model.UserActivity;
import com.helpdesk.repository.ProfileRepository;
import com.helpdesk.repository.UserActivityRepository;
import com.helpdesk.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for admin-only operations
 */
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProfileRepository profileRepository;
    private final UserActivityRepository userActivityRepository;
    private final UserService userService;

    /**
     * Get all users - only accessible to admins
     * @return List of all user profiles
     */
    @GetMapping("/users")
    @RequireRole("ADMIN")
    public ResponseEntity<List<Profile>> getAllUsers() {
        List<Profile> users = userService.getAllProfiles();
        return ResponseEntity.ok(users);
    }

    /**
     * Update a user's role - only accessible to admins
     * @param userId ID of the user to update
     * @param requestBody Map containing the new role
     * @return Updated user profile
     */
    @PutMapping("/users/{userId}/role")
    @RequireRole("ADMIN")
    public ResponseEntity<?> updateUserRole(
            @PathVariable String userId,
            @RequestBody Map<String, String> requestBody) {
        
        String roleName = requestBody.get("role");
        if (roleName == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role is required"));
        }
        
        try {
            Profile.Role newRole = Profile.Role.valueOf(roleName.toUpperCase());
            
            return userService.getProfileById(userId)
                .map(profile -> {
                    profile.setRole(newRole);
                    Profile updatedProfile = userService.updateProfile(profile);
                    
                    // Log this activity
                    userService.logActivity(
                        userId,
                        "ROLE_CHANGE",
                        "Role changed to " + newRole
                    );
                    
                    return ResponseEntity.ok(updatedProfile);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + roleName));
        }
    }
    
    /**
     * Bulk import users - only accessible to admins
     * @param users List of user profiles to import
     * @return Map containing success count and errors
     */
    /**
     * Request wrapper for bulk user import
     */
    static class BulkImportRequest {
        private List<Map<String, String>> users;
        
        public List<Map<String, String>> getUsers() {
            return users;
        }
        
        public void setUsers(List<Map<String, String>> users) {
            this.users = users;
        }
    }
    
    @PostMapping("/users/bulk-import")
    @RequireRole("ADMIN")
    public ResponseEntity<?> bulkImportUsers(@RequestBody BulkImportRequest request) {
        List<Map<String, String>> users = request.getUsers();
        if (users == null || users.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No users provided"));
        }
        
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        
        for (Map<String, String> userData : users) {
            try {
                String email = userData.get("email");
                String fullName = userData.get("fullName");
                String department = userData.get("department");
                String role = userData.get("role");
                
                if (email == null || email.isEmpty()) {
                    errors.add("Email is required for all users");
                    continue;
                }
                
                // Check if user already exists
                if (userService.getProfileByEmail(email).isPresent()) {
                    errors.add("User with email " + email + " already exists");
                    continue;
                }
                
                Profile profile = new Profile();
                profile.setId(UUID.randomUUID().toString());
                profile.setEmail(email);
                profile.setFullName(fullName);
                
                // Set department if valid
                if (department != null && !department.isEmpty()) {
                    try {
                        Profile.Department dept = Profile.Department.valueOf(department.toUpperCase());
                        profile.setDepartment(dept);
                    } catch (IllegalArgumentException e) {
                        errors.add("Invalid department for user " + email + ": " + department);
                    }
                }
                
                // Set role if valid
                if (role != null && !role.isEmpty()) {
                    try {
                        Profile.Role userRole = Profile.Role.valueOf(role.toUpperCase());
                        profile.setRole(userRole);
                    } catch (IllegalArgumentException e) {
                        errors.add("Invalid role for user " + email + ": " + role);
                        profile.setRole(Profile.Role.EMPLOYEE); // Default role
                    }
                } else {
                    profile.setRole(Profile.Role.EMPLOYEE); // Default role
                }
                
                // Save the profile
                userService.createProfile(profile);
                successCount++;
                
                // Log this activity
                userService.logActivity(
                    profile.getId(),
                    "USER_CREATED",
                    "User created via bulk import"
                );
                
            } catch (Exception e) {
                errors.add("Error processing user: " + e.getMessage());
            }
        }
        
        Map<String, Object> response = Map.of(
            "success", successCount > 0,
            "message", successCount + " users imported successfully" + (errors.isEmpty() ? "" : " with " + errors.size() + " errors"),
            "data", Map.of(
                "successCount", successCount,
                "errorCount", errors.size(),
                "errors", errors
            )
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get user activity logs - only accessible to admins
     * @param userId Optional user ID to filter activities
     * @param activityType Optional activity type to filter
     * @param from Optional start date to filter
     * @param to Optional end date to filter
     * @return List of user activities
     */
    @GetMapping("/user-activities")
    @RequireRole("ADMIN")
    public ResponseEntity<List<UserActivity>> getUserActivities(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String activityType,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        
        List<UserActivity> activities;
        
        if (userId != null && !userId.isEmpty()) {
            // Filter by user ID
            activities = userService.getUserActivities(userId);
        } else {
            // Get all activities
            activities = userService.getAllUserActivities();
        }
        
        // Apply additional filters if needed
        // This is a simple implementation - in a real app, you'd use a more sophisticated query builder
        
        return ResponseEntity.ok(activities);
    }
}
