package com.helpdesk.service;

import com.helpdesk.model.Profile;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.TicketResponse;
import com.helpdesk.repository.ProfileRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.TicketResponseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResponseService {

    private final TicketResponseRepository responseRepository;
    private final TicketRepository ticketRepository;
    private final ProfileRepository profileRepository;
    private final NotificationService notificationService;
    private final AIService aiService;

    /**
     * Get all responses for a specific ticket
     *
     * @param ticketId The ticket ID
     * @return List of responses for the ticket
     */
    @Transactional(readOnly = true)
    public List<TicketResponse> getResponsesByTicketId(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found with id: " + ticketId));
        
        return responseRepository.findByTicketOrderByCreatedAtAsc(ticket);
    }

    /**
     * Create a new response for a ticket
     *
     * @param ticketId The ticket ID
     * @param userId The user ID of the responder
     * @param content The response content
     * @param internal Whether the response is internal (only visible to support staff)
     * @return The created response
     */
    @Transactional
    public TicketResponse createResponse(String ticketId, String userId, String content, boolean internal) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found with id: " + ticketId));
        
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));
        
        TicketResponse response = TicketResponse.builder()
                .ticket(ticket)
                .user(user)
                .content(content)
                .internal(internal)
                .build();
        
        TicketResponse savedResponse = responseRepository.save(response);
        
        // If ticket is in OPEN status and a support agent responds, update to IN_PROGRESS
        if (ticket.getStatus() == Ticket.Status.OPEN && 
                (user.getRole() == Profile.Role.SUPPORT || user.getRole() == Profile.Role.ADMIN)) {
            ticket.setStatus(Ticket.Status.IN_PROGRESS);
            ticketRepository.save(ticket);
        }
        
        // Send notification for new response
        notificationService.notifyNewResponse(
                ticket.getId(), 
                savedResponse.getId(), 
                savedResponse.getContent(), 
                user.getId());
        
        log.info("Created new response for ticket ID: {} by user ID: {}", ticketId, userId);
        
        return savedResponse;
    }

    /**
     * Get AI-suggested responses for a ticket
     *
     * @param ticketId The ticket ID
     * @return List of suggested responses
     */
    public List<String> getSuggestedResponses(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found with id: " + ticketId));
        
        // Get previous responses to provide context
        List<TicketResponse> previousResponses = responseRepository.findByTicketOrderByCreatedAtAsc(ticket);
        List<String> previousResponseContents = previousResponses.stream()
                .map(TicketResponse::getContent)
                .toList();
        
        return aiService.generateResponseSuggestions(
                ticket.getTitle(), 
                ticket.getDescription(), 
                previousResponseContents);
    }

    /**
     * Delete a response
     *
     * @param responseId The response ID
     */
    @Transactional
    public void deleteResponse(String responseId) {
        TicketResponse response = responseRepository.findById(responseId)
                .orElseThrow(() -> new NoSuchElementException("Response not found with id: " + responseId));
        
        responseRepository.delete(response);
        log.info("Deleted response with ID: {}", responseId);
    }
}
