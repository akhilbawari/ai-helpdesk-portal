package com.helpdesk.service;

import com.helpdesk.model.Profile;
import com.helpdesk.model.UserActivity;
import com.helpdesk.repository.ProfileRepository;
import com.helpdesk.repository.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service for user management operations
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final ProfileRepository profileRepository;
    private final UserActivityRepository userActivityRepository;
    
    /**
     * Get all user profiles
     */
    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }
    
    /**
     * Get profile by ID
     */
    public Optional<Profile> getProfileById(String id) {
        return profileRepository.findById(id);
    }
    
    /**
     * Get profile by email
     */
    public Optional<Profile> getProfileByEmail(String email) {
        return profileRepository.findByEmail(email);
    }
    
    /**
     * Update user profile
     */
    public Profile updateProfile(Profile profile) {
        return profileRepository.save(profile);
    }
    
    /**
     * Create a new user profile
     */
    public Profile createProfile(Profile profile) {
        return profileRepository.save(profile);
    }
    
    /**
     * Log user activity
     */
    public UserActivity logActivity(String userId, String activityType, String description) {
        UserActivity activity = new UserActivity();
        activity.setUserId(userId);
        activity.setActivityType(activityType);
        activity.setDescription(description);
        activity.setTimestamp(LocalDateTime.now());
        return userActivityRepository.save(activity);
    }
    
    /**
     * Get user activities by user ID
     */
    public List<UserActivity> getUserActivities(String userId) {
        return userActivityRepository.findByUserIdOrderByTimestampDesc(userId);
    }
    
    /**
     * Get all user activities
     */
    public List<UserActivity> getAllUserActivities() {
        return userActivityRepository.findAllByOrderByTimestampDesc();
    }
}
