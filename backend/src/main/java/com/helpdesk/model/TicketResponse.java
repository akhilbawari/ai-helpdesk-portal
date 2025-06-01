package com.helpdesk.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.OffsetDateTime;

@Document(collection = "ticket_responses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    
    @Id
    private String id;
    
    @DBRef
    private Ticket ticket;
    
    @DBRef
    @Field("user")
    private Profile user;
    
    private String content;
    
    @Field("is_internal")
    private boolean internal = false;
    
    @CreatedDate
    private OffsetDateTime createdAt;
}
