package com.helpdesk.repository;

import com.helpdesk.model.UserActivity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for user activity tracking
 */
@Repository
public interface UserActivityRepository extends MongoRepository<UserActivity, String> {
    
    /**
     * Find activities by user ID ordered by timestamp (newest first)
     */
    List<UserActivity> findByUserIdOrderByTimestampDesc(String userId);
    
    /**
     * Find all activities ordered by timestamp (newest first)
     */
    List<UserActivity> findAllByOrderByTimestampDesc();
    
    /**
     * Find activities by activity type
     */
    List<UserActivity> findByActivityTypeOrderByTimestampDesc(String activityType);
    
    /**
     * Find activities within a date range
     */
    List<UserActivity> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime from, LocalDateTime to);
    
    /**
     * Find activities by user ID and activity type
     */
    List<UserActivity> findByUserIdAndActivityTypeOrderByTimestampDesc(String userId, String activityType);
}
