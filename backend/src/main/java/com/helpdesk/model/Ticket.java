package com.helpdesk.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Document(collection = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    
    @Id
    private String id;
    
    @Field("title")
    private String title;
    
    @Field("description")
    private String description;
    
    @Field("status")
    private Status status = Status.OPEN;
    
    @Field("priority")
    private Priority priority = Priority.MEDIUM;
    
    @Field("category")
    private Profile.Department category;
    
    @DBRef
    @Field("created_by")
    private Profile createdBy;
    
    @DBRef
    @Field("assigned_to")
    private Profile assignedTo;
    
    @CreatedDate
    @Field("created_at")
    private OffsetDateTime createdAt;
    
    @LastModifiedDate
    @Field("updated_at")
    private OffsetDateTime updatedAt;
    
    @Field("resolved_at")
    private OffsetDateTime resolvedAt;
    
    @Field("ai_confidence_score")
    private BigDecimal aiConfidenceScore;
    
    public enum Status {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED
    }
    
    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}
