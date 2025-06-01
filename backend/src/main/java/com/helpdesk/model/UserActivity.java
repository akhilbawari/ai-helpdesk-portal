package com.helpdesk.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * Document to track user activities for admin monitoring
 */
@Document(collection = "user_activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserActivity {
    
    @Id
    private String id;
    
    private String userId;
    
    private String activityType;
    
    private String description;
    
    private LocalDateTime timestamp;
    
    private String ipAddress;
    
    private String userAgent;
    
    private String metadata;
}
