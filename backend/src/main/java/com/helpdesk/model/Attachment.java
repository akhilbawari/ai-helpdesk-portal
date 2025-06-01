package com.helpdesk.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.OffsetDateTime;

@Document(collection = "attachments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {
    
    @Id
    private String id;
    
    @DBRef
    private Ticket ticket;
    
    private String fileName;
    
    private String filePath;
    
    private Long fileSize;
    
    private String mimeType;
    
    @DBRef
    private Profile uploadedBy;
    
    @CreatedDate
    private OffsetDateTime createdAt;
}
