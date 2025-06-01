package com.helpdesk.service;

import com.helpdesk.model.Ticket;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    
    /**
     * Send a notification when a ticket is created
     *
     * @param ticket The newly created ticket
     */
    public void notifyTicketCreated(Ticket ticket) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "TICKET_CREATED");
        notification.put("ticket", ticket);
        notification.put("message", "New ticket created: " + ticket.getTitle());
        
        // Send to all users subscribed to the tickets topic
        messagingTemplate.convertAndSend("/topic/tickets", notification);
        
        // Send to department-specific topic
        if (ticket.getCategory() != null) {
            messagingTemplate.convertAndSend("/topic/department/" + ticket.getCategory(), notification);
        }
        
        log.info("Sent ticket creation notification for ticket ID: {}", ticket.getId());
    }
    
    /**
     * Send a notification when a ticket is updated
     *
     * @param ticket The updated ticket
     */
    public void notifyTicketUpdated(Ticket ticket) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "TICKET_UPDATED");
        notification.put("ticket", ticket);
        notification.put("message", "Ticket updated: " + ticket.getTitle());
        
        // Send to all users subscribed to the tickets topic
        messagingTemplate.convertAndSend("/topic/tickets", notification);
        
        // Send to specific ticket topic
        messagingTemplate.convertAndSend("/topic/ticket/" + ticket.getId(), notification);
        
        // Send to department-specific topic
        if (ticket.getCategory() != null) {
            messagingTemplate.convertAndSend("/topic/department/" + ticket.getCategory(), notification);
        }
        
        // Send to assigned user topic if assigned
        if (ticket.getAssignedTo() != null) {
            messagingTemplate.convertAndSend("/topic/user/" + ticket.getAssignedTo().getId(), notification);
        }
        
        // Send to creator topic
        if (ticket.getCreatedBy() != null) {
            messagingTemplate.convertAndSend("/topic/user/" + ticket.getCreatedBy().getId(), notification);
        }
        
        log.info("Sent ticket update notification for ticket ID: {}", ticket.getId());
    }
    
    /**
     * Send a notification when a ticket status changes
     *
     * @param ticket The ticket with updated status
     * @param oldStatus The previous status
     */
    public void notifyTicketStatusChanged(Ticket ticket, Ticket.Status oldStatus) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "STATUS_CHANGED");
        notification.put("ticket", ticket);
        notification.put("oldStatus", oldStatus);
        notification.put("newStatus", ticket.getStatus());
        notification.put("message", "Ticket status changed from " + oldStatus + " to " + ticket.getStatus());
        
        // Send to all users subscribed to the tickets topic
        messagingTemplate.convertAndSend("/topic/tickets", notification);
        
        // Send to specific ticket topic
        messagingTemplate.convertAndSend("/topic/ticket/" + ticket.getId(), notification);
        
        // Send to assigned user topic if assigned
        if (ticket.getAssignedTo() != null) {
            messagingTemplate.convertAndSend("/topic/user/" + ticket.getAssignedTo().getId(), notification);
        }
        
        // Send to creator topic
        if (ticket.getCreatedBy() != null) {
            messagingTemplate.convertAndSend("/topic/user/" + ticket.getCreatedBy().getId(), notification);
        }
        
        log.info("Sent ticket status change notification for ticket ID: {}", ticket.getId());
    }
    
    /**
     * Send a notification when a new response is added to a ticket
     *
     * @param ticketId The ID of the ticket
     * @param responseId The ID of the new response
     * @param content The content of the response
     * @param authorId The ID of the response author
     */
    public void notifyNewResponse(String ticketId, String responseId, String content, String authorId) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "NEW_RESPONSE");
        notification.put("ticketId", ticketId);
        notification.put("responseId", responseId);
        notification.put("content", content);
        notification.put("authorId", authorId);
        notification.put("message", "New response added to ticket");
        
        // Send to specific ticket topic
        messagingTemplate.convertAndSend("/topic/ticket/" + ticketId, notification);
        
        log.info("Sent new response notification for ticket ID: {}", ticketId);
    }
}
