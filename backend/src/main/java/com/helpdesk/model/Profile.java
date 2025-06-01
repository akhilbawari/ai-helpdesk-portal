package com.helpdesk.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.OffsetDateTime;
import java.util.Map;

@Document(collection = "profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Profile {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    
    private String fullName;
    
    private String profilePicture;
    
    @Builder.Default
    private Role role = Role.EMPLOYEE;
    
    private Department department;
    
    private String authProvider; // "local", "google", "github", etc.
    
    private String providerId; // ID from the OAuth provider
    
    @Builder.Default
    private boolean emailVerified = false;
    
    private Map<String, Object> providerData; // Additional data from provider
    
    @CreatedDate
    private OffsetDateTime createdAt;
    
    @LastModifiedDate
    private OffsetDateTime updatedAt;
    
    public enum Role {
        EMPLOYEE, SUPPORT, ADMIN
    }
    
    public enum Department {
        IT, HR, ADMIN
    }
}
