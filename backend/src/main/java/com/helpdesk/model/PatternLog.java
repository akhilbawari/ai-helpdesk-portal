package com.helpdesk.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.OffsetDateTime;
import java.util.Map;

@Document(collection = "pattern_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatternLog {
    
    @Id
    private String id;
    
    @Field("pattern_type")
    private String patternType;
    
    private String description;
    
    private Map<String, Object> metadata;
    
    @CreatedDate
    private OffsetDateTime createdAt;
}
