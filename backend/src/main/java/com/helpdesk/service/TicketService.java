package com.helpdesk.service;

import com.helpdesk.model.Profile;
import com.helpdesk.model.Ticket;
import com.helpdesk.repository.ProfileRepository;
import com.helpdesk.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {
    
    private final TicketRepository ticketRepository;
    private final ProfileRepository profileRepository;
    private final NotificationService notificationService;
    private final AIService aiService;
    
    @Transactional(readOnly = true)
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Ticket not found with id: " + id));
    }
    
    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByCreatedBy(String userId) {
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));
        return ticketRepository.findByCreatedBy(user);
    }
    
    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByAssignedTo(String userId) {
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + userId));
        return ticketRepository.findByAssignedTo(user);
    }
    
    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByStatus(Ticket.Status status) {
        return ticketRepository.findByStatus(status);
    }
    
    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByCategory(Profile.Department category) {
        return ticketRepository.findByCategory(category);
    }
    
    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByPriority(Ticket.Priority priority) {
        return ticketRepository.findByPriority(priority);
    }
    
    @Transactional(readOnly = true)
    public List<Ticket> getTicketsByCategoryAndStatus(Profile.Department category, Ticket.Status status) {
        return ticketRepository.findByCategoryAndStatus(category, status);
    }
    
    @Transactional
    public Ticket createTicket(Ticket ticket) {
        // Set default values if not provided
        if (ticket.getStatus() == null) {
            ticket.setStatus(Ticket.Status.OPEN);
        }
        
        if (ticket.getPriority() == null) {
            ticket.setPriority(Ticket.Priority.MEDIUM);
        }
        
        // Auto-route the ticket if category is not specified
        if (ticket.getCategory() == null && ticket.getTitle() != null && ticket.getDescription() != null) {
            try {
                var routingResult = aiService.routeTicket(ticket.getTitle(), ticket.getDescription());
                ticket.setCategory((Profile.Department) routingResult.get("department"));
                ticket.setAiConfidenceScore((java.math.BigDecimal) routingResult.get("confidenceScore"));
                
                log.info("AI routed ticket to {} department with confidence {}", 
                         ticket.getCategory(), ticket.getAiConfidenceScore());
            } catch (Exception e) {
                log.error("Error auto-routing ticket", e);
                // Default to ADMIN if auto-routing fails
                ticket.setCategory(Profile.Department.ADMIN);
            }
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Send notification for ticket creation
        notificationService.notifyTicketCreated(savedTicket);
        
        return savedTicket;
    }
    
    @Transactional
    public Ticket updateTicket(String id, Ticket ticketDetails) {
        Ticket ticket = getTicketById(id);
        Ticket.Status oldStatus = ticket.getStatus();
        boolean statusChanged = false;
        
        if (ticketDetails.getTitle() != null) {
            ticket.setTitle(ticketDetails.getTitle());
        }
        
        if (ticketDetails.getDescription() != null) {
            ticket.setDescription(ticketDetails.getDescription());
        }
        
        if (ticketDetails.getStatus() != null && !ticketDetails.getStatus().equals(oldStatus)) {
            ticket.setStatus(ticketDetails.getStatus());
            statusChanged = true;
            
            // If status is changed to RESOLVED, set the resolvedAt timestamp
            if (ticketDetails.getStatus() == Ticket.Status.RESOLVED && ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(OffsetDateTime.now());
            }
        }
        
        if (ticketDetails.getPriority() != null) {
            ticket.setPriority(ticketDetails.getPriority());
        }
        
        if (ticketDetails.getCategory() != null) {
            ticket.setCategory(ticketDetails.getCategory());
        }
        
        if (ticketDetails.getAssignedTo() != null) {
            ticket.setAssignedTo(ticketDetails.getAssignedTo());
        }
        
        if (ticketDetails.getAiConfidenceScore() != null) {
            ticket.setAiConfidenceScore(ticketDetails.getAiConfidenceScore());
        }
        
        Ticket updatedTicket = ticketRepository.save(ticket);
        
        // Send appropriate notifications
        if (statusChanged) {
            notificationService.notifyTicketStatusChanged(updatedTicket, oldStatus);
        } else {
            notificationService.notifyTicketUpdated(updatedTicket);
        }
        
        return updatedTicket;
    }
    
    @Transactional
    public Ticket assignTicket(String ticketId, String assigneeId) {
        Ticket ticket = getTicketById(ticketId);
        Ticket.Status oldStatus = ticket.getStatus();
        
        Profile assignee = profileRepository.findById(assigneeId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + assigneeId));
        
        ticket.setAssignedTo(assignee);
        
        // Only change status to IN_PROGRESS if it's currently OPEN
        if (ticket.getStatus() == Ticket.Status.OPEN) {
            ticket.setStatus(Ticket.Status.IN_PROGRESS);
        }
        
        Ticket updatedTicket = ticketRepository.save(ticket);
        
        // Send status change notification if status changed
        if (!oldStatus.equals(updatedTicket.getStatus())) {
            notificationService.notifyTicketStatusChanged(updatedTicket, oldStatus);
        } else {
            notificationService.notifyTicketUpdated(updatedTicket);
        }
        
        return updatedTicket;
    }
    
    @Transactional
    public void deleteTicket(String id) {
        Ticket ticket = getTicketById(id);
        ticketRepository.delete(ticket);
        log.info("Deleted ticket with id: {}", id);
    }
}
