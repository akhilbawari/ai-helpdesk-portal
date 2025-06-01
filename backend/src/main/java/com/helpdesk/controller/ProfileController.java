package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.model.Profile;
import com.helpdesk.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {
    
    private final ProfileService profileService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Profile>>> getAllProfiles() {
        log.info("Fetching all profiles");
        List<Profile> profiles = profileService.getAllProfiles();
        return ResponseEntity.ok(ApiResponse.success(profiles, "Profiles retrieved successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<Profile>> getProfileById(@PathVariable String id) {
        log.info("Fetching profile with id: {}", id);
        Profile profile = profileService.getProfileById(id);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved successfully"));
    }
    
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN') or #email == authentication.principal.username")
    public ResponseEntity<ApiResponse<Profile>> getProfileByEmail(@PathVariable String email) {
        log.info("Fetching profile with email: {}", email);
        Profile profile = profileService.getProfileByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved successfully"));
    }
    
    @GetMapping("/department/{department}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
    public ResponseEntity<ApiResponse<List<Profile>>> getProfilesByDepartment(@PathVariable Profile.Department department) {
        log.info("Fetching profiles in department: {}", department);
        List<Profile> profiles = profileService.getProfilesByDepartment(department);
        return ResponseEntity.ok(ApiResponse.success(profiles, "Profiles retrieved successfully"));
    }
    
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Profile>>> getProfilesByRole(@PathVariable Profile.Role role) {
        log.info("Fetching profiles with role: {}", role);
        List<Profile> profiles = profileService.getProfilesByRole(role);
        return ResponseEntity.ok(ApiResponse.success(profiles, "Profiles retrieved successfully"));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Profile>> createProfile(@RequestBody Profile profile) {
        log.info("Creating new profile for email: {}", profile.getEmail());
        Profile createdProfile = profileService.createProfile(profile);
        return new ResponseEntity<>(ApiResponse.success(createdProfile, "Profile created successfully"), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<Profile>> updateProfile(@PathVariable String id, @RequestBody Profile profile) {
        log.info("Updating profile with id: {}", id);
        Profile updatedProfile = profileService.updateProfile(id, profile);
        return ResponseEntity.ok(ApiResponse.success(updatedProfile, "Profile updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(@PathVariable String id) {
        log.info("Deleting profile with id: {}", id);
        profileService.deleteProfile(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Profile deleted successfully"));
    }
}
