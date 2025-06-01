package com.helpdesk.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Model for knowledge base documents
 */
@Document(collection = "knowledge_documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeDocument {
    
    @Id
    private String id;
    
    @TextIndexed
    private String title;
    
    @TextIndexed
    private String content;
    
    private DocumentType documentType;
    
    private List<String> tags;
    
    private Profile.Department department;
    
    @DBRef
    private Profile createdBy;
    
    @DBRef
    private Profile lastUpdatedBy;
    
    @CreatedDate
    private OffsetDateTime createdAt;
    
    @LastModifiedDate
    private OffsetDateTime updatedAt;
    
    @Builder.Default
    private boolean published = false;
    
    /**
     * Types of knowledge documents
     */
    public enum DocumentType {
        ARTICLE,
        FAQ,
        TROUBLESHOOTING_GUIDE,
        POLICY,
        PROCEDURE
    }
}
