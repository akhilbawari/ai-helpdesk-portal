package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.model.Profile;
import com.helpdesk.model.Ticket;
import com.helpdesk.repository.ProfileRepository;
import com.helpdesk.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@Slf4j
public class TicketController {
    
    private final TicketService ticketService;
    private final ProfileRepository profileRepository;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
    public ResponseEntity<ApiResponse<List<Ticket>>> getAllTickets() {
        log.info("Fetching all tickets");
        List<Ticket> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(ApiResponse.success(tickets, "Tickets retrieved successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT') or @ticketSecurity.isTicketCreator(authentication, #id)")
    public ResponseEntity<ApiResponse<Ticket>> getTicketById(@PathVariable String id) {
        log.info("Fetching ticket with id: {}", id);
        Ticket ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(ApiResponse.success(ticket, "Ticket retrieved successfully"));
    }
    
    @GetMapping("/created-by/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByCreatedBy(@PathVariable String userId) {
        log.info("Fetching tickets created by user: {}", userId);
        List<Ticket> tickets = ticketService.getTicketsByCreatedBy(userId);
        return ResponseEntity.ok(ApiResponse.success(tickets, "Tickets retrieved successfully"));
    }
    
    @GetMapping("/assigned-to/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT') or #userId == authentication.principal.id")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByAssignedTo(@PathVariable String userId) {
        log.info("Fetching tickets assigned to user: {}", userId);
        List<Ticket> tickets = ticketService.getTicketsByAssignedTo(userId);
        return ResponseEntity.ok(ApiResponse.success(tickets, "Tickets retrieved successfully"));
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByStatus(@PathVariable Ticket.Status status) {
        log.info("Fetching tickets with status: {}", status);
        List<Ticket> tickets = ticketService.getTicketsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(tickets, "Tickets retrieved successfully"));
    }
    
    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByCategory(@PathVariable Profile.Department category) {
        log.info("Fetching tickets in category: {}", category);
        List<Ticket> tickets = ticketService.getTicketsByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(tickets, "Tickets retrieved successfully"));
    }
    
    @GetMapping("/priority/{priority}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByPriority(@PathVariable Ticket.Priority priority) {
        log.info("Fetching tickets with priority: {}", priority);
        List<Ticket> tickets = ticketService.getTicketsByPriority(priority);
        return ResponseEntity.ok(ApiResponse.success(tickets, "Tickets retrieved successfully"));
    }
    
    @GetMapping("/category/{category}/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
    public ResponseEntity<ApiResponse<List<Ticket>>> getTicketsByCategoryAndStatus(
            @PathVariable Profile.Department category,
            @PathVariable Ticket.Status status) {
        log.info("Fetching tickets in category: {} with status: {}", category, status);
        List<Ticket> tickets = ticketService.getTicketsByCategoryAndStatus(category, status);
        return ResponseEntity.ok(ApiResponse.success(tickets, "Tickets retrieved successfully"));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Ticket>> createTicket(@RequestBody Ticket ticket, Authentication authentication) {
        // Get the authenticated user ID
        String userId = authentication.getName();
        log.info("Creating ticket for user: {}", userId);
        
        // Fetch the existing profile from the repository
        Profile creator = profileRepository.findById(userId)
            .orElseThrow(() -> {
                log.error("User profile not found for ID: {}", userId);
                return new NoSuchElementException("User profile not found for ID: " + userId);
            });
        
        log.info("Found existing profile for user: {} with email: {}", userId, creator.getEmail());
        ticket.setCreatedBy(creator);
        
        Ticket createdTicket = ticketService.createTicket(ticket);
        return new ResponseEntity<>(ApiResponse.success(createdTicket, "Ticket created successfully"), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT') or @ticketSecurity.isTicketCreator(authentication, #id)")
    public ResponseEntity<ApiResponse<Ticket>> updateTicket(@PathVariable String id, @RequestBody Ticket ticket) {
        log.info("Updating ticket with id: {}", id);
        Ticket updatedTicket = ticketService.updateTicket(id, ticket);
        return ResponseEntity.ok(ApiResponse.success(updatedTicket, "Ticket updated successfully"));
    }
    
    @PutMapping("/{ticketId}/assign/{assigneeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
    public ResponseEntity<ApiResponse<Ticket>> assignTicket(
            @PathVariable String ticketId,
            @PathVariable String assigneeId) {
        log.info("Assigning ticket {} to user {}", ticketId, assigneeId);
        Ticket assignedTicket = ticketService.assignTicket(ticketId, assigneeId);
        return ResponseEntity.ok(ApiResponse.success(assignedTicket, "Ticket assigned successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable String id) {
        log.info("Deleting ticket with id: {}", id);
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Ticket deleted successfully"));
    }
}
