package com.helpdesk.config;

import com.helpdesk.model.Attachment;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.TicketResponse;
import com.helpdesk.repository.AttachmentRepository;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.TicketResponseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;


@Component("ticketSecurity")
@RequiredArgsConstructor
public class TicketSecurity {

    private final TicketRepository ticketRepository;
    private final TicketResponseRepository ticketResponseRepository;
    private final AttachmentRepository attachmentRepository;

    /**
     * Check if the authenticated user is the creator of the ticket
     */
    public boolean isTicketCreator(Authentication authentication, String ticketId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String userId = authentication.getName();
        return ticketRepository.findById(ticketId)
                .map(ticket -> ticket.getCreatedBy().getId().equals(userId))
                .orElse(false);
    }

    /**
     * Check if the authenticated user is the creator of the response
     */
    public boolean isResponseCreator(Authentication authentication, String responseId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String userId = authentication.getName();
        return ticketResponseRepository.findById(responseId)
                .map(response -> response.getUser().getId().equals(userId))
                .orElse(false);
    }

    /**
     * Check if the authenticated user can view a specific response
     * (either admin, support, ticket creator, or response creator)
     */
    public boolean canViewResponse(Authentication authentication, String responseId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // Admin and Support can view all responses
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                               a.getAuthority().equals("ROLE_SUPPORT"))) {
            return true;
        }

        String userId = authentication.getName();
        
        // Check if user is the response creator
        if (isResponseCreator(authentication, responseId)) {
            return true;
        }
        
        // Check if user is the ticket creator
        return ticketResponseRepository.findById(responseId)
                .map(response -> {
                    Ticket ticket = response.getTicket();
                    return ticket.getCreatedBy().getId().equals(userId);
                })
                .orElse(false);
    }

    /**
     * Check if the authenticated user is the uploader of the attachment
     */
    public boolean isAttachmentUploader(Authentication authentication, String attachmentId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String userId = authentication.getName();
        return attachmentRepository.findById(attachmentId)
                .map(attachment -> attachment.getUploadedBy().getId().equals(userId))
                .orElse(false);
    }

    /**
     * Check if the authenticated user can view a specific attachment
     * (either admin, support, ticket creator, or attachment uploader)
     */
    public boolean canViewAttachment(Authentication authentication, String attachmentId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // Admin and Support can view all attachments
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                               a.getAuthority().equals("ROLE_SUPPORT"))) {
            return true;
        }

        String userId = authentication.getName();
        
        // Check if user is the attachment uploader
        if (isAttachmentUploader(authentication, attachmentId)) {
            return true;
        }
        
        // Check if user is the ticket creator
        return attachmentRepository.findById(attachmentId)
                .map(attachment -> {
                    Ticket ticket = attachment.getTicket();
                    return ticket.getCreatedBy().getId().equals(userId);
                })
                .orElse(false);
    }
}
