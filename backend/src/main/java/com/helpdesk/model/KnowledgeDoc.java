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

import java.time.OffsetDateTime;

@Document(collection = "knowledge_docs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeDoc {
    
    @Id
    private String id;
    
    private String title;
    
    private String content;
    
    private Profile.Department category;
    
    @Field("embedding")
    private byte[] embedding;
    
    @DBRef
    @Field("created_by")
    private Profile createdBy;
    
    @CreatedDate
    private OffsetDateTime createdAt;
    
    @LastModifiedDate
    private OffsetDateTime updatedAt;
}
