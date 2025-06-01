package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.model.Profile;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.TicketResponse;
import com.helpdesk.service.TicketResponseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ticket-responses")
@RequiredArgsConstructor
@Slf4j
public class TicketResponseController {
    
    private final TicketResponseService ticketResponseService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAllResponses() {
        log.info("Fetching all ticket responses");
        List<TicketResponse> responses = ticketResponseService.getAllResponses();
        return ResponseEntity.ok(ApiResponse.success(responses, "Responses retrieved successfully"));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT') or @ticketSecurity.canViewResponse(authentication, #id)")
    public ResponseEntity<ApiResponse<TicketResponse>> getResponseById(@PathVariable String id) {
        log.info("Fetching ticket response with id: {}", id);
        TicketResponse response = ticketResponseService.getResponseById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Response retrieved successfully"));
    }
    
    @GetMapping("/ticket/{ticketId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT') or @ticketSecurity.isTicketCreator(authentication, #ticketId)")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getResponsesByTicket(@PathVariable String ticketId) {
        log.info("Fetching responses for ticket: {}", ticketId);
        List<TicketResponse> responses = ticketResponseService.getResponsesByTicket(ticketId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Responses retrieved successfully"));
    }
    
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getResponsesByUser(@PathVariable String userId) {
        log.info("Fetching responses by user: {}", userId);
        List<TicketResponse> responses = ticketResponseService.getResponsesByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Responses retrieved successfully"));
    }
    
    @GetMapping("/ticket/{ticketId}/internal")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getInternalResponsesByTicket(@PathVariable String ticketId) {
        log.info("Fetching internal responses for ticket: {}", ticketId);
        List<TicketResponse> responses = ticketResponseService.getInternalResponsesByTicket(ticketId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Internal responses retrieved successfully"));
    }
    
    @GetMapping("/ticket/{ticketId}/public")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT') or @ticketSecurity.isTicketCreator(authentication, #ticketId)")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getPublicResponsesByTicket(@PathVariable String ticketId) {
        log.info("Fetching public responses for ticket: {}", ticketId);
        List<TicketResponse> responses = ticketResponseService.getPublicResponsesByTicket(ticketId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Public responses retrieved successfully"));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT') or @ticketSecurity.isTicketCreator(authentication, #response.ticket.id)")
    public ResponseEntity<ApiResponse<TicketResponse>> createResponse(
            @RequestBody TicketResponse response,
            Authentication authentication) {
        
        // Set the user to the authenticated user
        String userId = authentication.getName();
        log.info("Creating ticket response by user: {}", userId);
        
        Profile user = new Profile();
        user.setId(userId);
        response.setUser(user);
        
        // Only support and admin can create internal responses
        if (response.isInternal() && 
            !(authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                               a.getAuthority().equals("ROLE_SUPPORT")))) {
            log.info("Setting response to public as user does not have ADMIN or SUPPORT role");
            response.setInternal(false);
        }
        
        TicketResponse createdResponse = ticketResponseService.createResponse(response);
        return new ResponseEntity<>(ApiResponse.success(createdResponse, "Response created successfully"), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @ticketSecurity.isResponseCreator(authentication, #id)")
    public ResponseEntity<ApiResponse<TicketResponse>> updateResponse(
            @PathVariable String id,
            @RequestBody TicketResponse response,
            Authentication authentication) {
        
        log.info("Updating ticket response with id: {}", id);
        
        // Only support and admin can update to internal
        if (response.isInternal() && 
            !(authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || 
                               a.getAuthority().equals("ROLE_SUPPORT")))) {
            log.info("Setting response to public as user does not have ADMIN or SUPPORT role");
            response.setInternal(false);
        }
        
        TicketResponse updatedResponse = ticketResponseService.updateResponse(id, response);
        return ResponseEntity.ok(ApiResponse.success(updatedResponse, "Response updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @ticketSecurity.isResponseCreator(authentication, #id)")
    public ResponseEntity<ApiResponse<Void>> deleteResponse(@PathVariable String id) {
        log.info("Deleting ticket response with id: {}", id);
        ticketResponseService.deleteResponse(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Response deleted successfully"));
    }
}
