package com.helpdesk.controller;

import com.helpdesk.model.Ticket;
import com.helpdesk.model.TicketResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for handling WebSocket messages
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketController {

    /**
     * Handle ticket updates sent by clients and broadcast to all subscribers
     *
     * @param ticket The updated ticket
     * @return The ticket update notification
     */
    @MessageMapping("/ticket/update")
    @SendTo("/topic/tickets")
    public Map<String, Object> broadcastTicketUpdate(Ticket ticket) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "TICKET_UPDATED");
        notification.put("ticket", ticket);
        notification.put("message", "Ticket updated: " + ticket.getTitle());
        
        log.info("Broadcasting ticket update for ticket ID: {}", ticket.getId());
        return notification;
    }

    /**
     * Handle new responses sent by clients and broadcast to specific ticket topic
     *
     * @param ticketId The ticket ID
     * @param response The new response
     * @return The response notification
     */
    @MessageMapping("/ticket/{ticketId}/response")
    @SendTo("/topic/ticket/{ticketId}")
    public Map<String, Object> broadcastNewResponse(
            @DestinationVariable String ticketId, 
            TicketResponse response) {
        
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "NEW_RESPONSE");
        notification.put("ticketId", ticketId);
        notification.put("response", response);
        notification.put("message", "New response added to ticket");
        
        log.info("Broadcasting new response for ticket ID: {}", ticketId);
        return notification;
    }

    /**
     * Handle user presence updates
     *
     * @param userId The user ID
     * @param status The user status (online/offline)
     * @return The user status notification
     */
    @MessageMapping("/user/{userId}/status")
    @SendTo("/topic/users")
    public Map<String, Object> broadcastUserStatus(
            @DestinationVariable String userId, 
            String status) {
        
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "USER_STATUS");
        notification.put("userId", userId);
        notification.put("status", status);
        
        log.info("Broadcasting user status update for user ID: {}", userId);
        return notification;
    }
}
