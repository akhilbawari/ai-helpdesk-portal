package com.helpdesk.controller;

import com.helpdesk.model.TicketResponse;
import com.helpdesk.service.ResponseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/responses")
@RequiredArgsConstructor
@Slf4j
public class ResponseController {

    private final ResponseService responseService;

    /**
     * Get all responses for a specific ticket
     *
     * @param ticketId The ticket ID
     * @return List of responses for the ticket
     */
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<TicketResponse>> getResponsesByTicketId(@PathVariable String ticketId) {
        try {
            List<TicketResponse> responses = responseService.getResponsesByTicketId(ticketId);
            return ResponseEntity.ok(responses);
        } catch (NoSuchElementException e) {
            log.error("Error getting responses for ticket ID: {}", ticketId, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create a new response for a ticket
     *
     * @param ticketId The ticket ID
     * @param requestBody Map containing response content and internal flag
     * @return The created response
     */
    @PostMapping("/ticket/{ticketId}")
    public ResponseEntity<TicketResponse> createResponse(
            @PathVariable String ticketId,
            @RequestParam String userId,
            @RequestBody Map<String, Object> requestBody) {
        
        try {
            String content = (String) requestBody.get("content");
            boolean internal = requestBody.containsKey("internal") && (boolean) requestBody.get("internal");
            
            TicketResponse response = responseService.createResponse(ticketId, userId, content, internal);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (NoSuchElementException e) {
            log.error("Error creating response for ticket ID: {}", ticketId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Unexpected error creating response", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get AI-suggested responses for a ticket
     *
     * @param ticketId The ticket ID
     * @return List of suggested responses
     */
    @GetMapping("/ticket/{ticketId}/suggestions")
    @PreAuthorize("hasAnyRole('SUPPORT', 'ADMIN')")
    public ResponseEntity<List<String>> getSuggestedResponses(@PathVariable String ticketId) {
        try {
            List<String> suggestions = responseService.getSuggestedResponses(ticketId);
            return ResponseEntity.ok(suggestions);
        } catch (NoSuchElementException e) {
            log.error("Error getting suggested responses for ticket ID: {}", ticketId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Unexpected error getting suggested responses", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a response
     *
     * @param responseId The response ID
     * @return No content on success
     */
    @DeleteMapping("/{responseId}")
    @PreAuthorize("hasAnyRole('SUPPORT', 'ADMIN')")
    public ResponseEntity<Void> deleteResponse(@PathVariable String responseId) {
        try {
            responseService.deleteResponse(responseId);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            log.error("Error deleting response with ID: {}", responseId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Unexpected error deleting response", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
