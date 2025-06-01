package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.service.AIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Slf4j
public class AIController {
    
    private final AIService aiService;
    
    @PostMapping("/route-ticket")
    public ResponseEntity<ApiResponse<Map<String, Object>>> routeTicket(
            @RequestBody Map<String, String> request) {
        
        String title = request.get("title");
        String description = request.get("description");
        
        log.info("AI routing ticket with title: {}", title);
        Map<String, Object> routingResult = aiService.routeTicket(title, description);
        
        return ResponseEntity.ok(ApiResponse.success(routingResult, "Ticket routing suggestions generated"));
    }
    
    @PostMapping("/suggest-response")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
    public ResponseEntity<ApiResponse<List<String>>> suggestResponse(
            @RequestBody Map<String, Object> request) {
        
        String ticketTitle = (String) request.get("ticketTitle");
        String ticketDescription = (String) request.get("ticketDescription");
        
        @SuppressWarnings("unchecked")
        List<String> previousResponses = (List<String>) request.get("previousResponses");
        
        log.info("AI generating response suggestions for ticket: {}", ticketTitle);
        List<String> suggestions = aiService.generateResponseSuggestions(
                ticketTitle, ticketDescription, previousResponses);
        
        return ResponseEntity.ok(ApiResponse.success(suggestions, "Response suggestions generated"));
    }
    
    @PostMapping("/detect-patterns")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> detectPatterns(
            @RequestBody Map<String, Object> request) {
        
        @SuppressWarnings("unchecked")
        List<Object> ticketObjects = (List<Object>) request.get("recentTickets");
        
        List<String> ticketDescriptions = new ArrayList<>();
        
        if (ticketObjects != null) {
            for (Object ticketObj : ticketObjects) {
                if (ticketObj instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> ticket = (Map<String, Object>) ticketObj;
                    
                    // Extract title and description
                    String title = ticket.containsKey("title") ? String.valueOf(ticket.get("title")) : "";
                    String description = ticket.containsKey("description") ? String.valueOf(ticket.get("description")) : "";
                    
                    // Combine title and description for pattern analysis
                    String ticketText = title + ": " + description;
                    ticketDescriptions.add(ticketText);
                } else if (ticketObj instanceof String) {
                    // Handle case where it's already a string
                    ticketDescriptions.add((String) ticketObj);
                }
            }
        }

        log.info("AI detecting patterns in {} recent tickets", ticketDescriptions.size());
        Map<String, Object> patterns = aiService.detectPatterns(ticketDescriptions);
        
        return ResponseEntity.ok(ApiResponse.success(patterns, "Ticket patterns detected"));
    }
}
