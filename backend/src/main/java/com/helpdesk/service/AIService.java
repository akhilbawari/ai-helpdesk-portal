package com.helpdesk.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.helpdesk.model.Profile;
import com.helpdesk.util.GeminiApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final GeminiApiClient geminiApiClient;

    /**
     * Analyzes ticket content and suggests the appropriate department
     *
     * @param title Ticket title
     * @param description Ticket description
     * @return Map containing department, confidence score, and reasoning
     */
    public Map<String, Object> routeTicket(String title, String description) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Construct prompt for Gemini API
            String prompt = String.format(
                "Analyze this helpdesk ticket and determine which department it should be routed to.\n" +
                "Available departments: IT, HR, ADMIN\n\n" +
                "Ticket Title: %s\n" +
                "Ticket Description: %s\n\n" +
                "Respond with a JSON object containing:\n" +
                "1. \"department\": The department this ticket should be routed to (IT, HR, or ADMIN)\n" +
                "2. \"confidenceScore\": A number between 0 and 1 indicating your confidence (e.g., 0.85)\n" +
                "3. \"reasoning\": A brief explanation of why you chose this department\n\n" +
                "Example response format:\n" +
                "{\n" +
                "  \"department\": \"IT\",\n" +
                "  \"confidenceScore\": 0.92,\n" +
                "  \"reasoning\": \"This ticket is about a computer hardware issue which falls under IT's responsibility.\"\n" +
                "}\n", title, description);
            
            JsonNode responseJson = geminiApiClient.generateStructuredContent(prompt);
            
            if (responseJson != null) {
                String department = responseJson.path("department").asText();
                double confidenceScore = responseJson.path("confidenceScore").asDouble();
                String reasoning = responseJson.path("reasoning").asText();
                
                // Convert string department to enum
                Profile.Department departmentEnum;
                try {
                    departmentEnum = Profile.Department.valueOf(department);
                } catch (IllegalArgumentException e) {
                    // Default to ADMIN if department is invalid
                    departmentEnum = Profile.Department.ADMIN;
                    log.warn("Invalid department '{}' returned from AI, defaulting to ADMIN", department);
                }
                
                result.put("department", departmentEnum);
                result.put("confidenceScore", new BigDecimal(String.valueOf(confidenceScore)));
                result.put("reasoning", reasoning);
            } else {
                // Fallback to simple keyword matching if AI fails
                return fallbackRouteTicket(title, description);
            }
        } catch (Exception e) {
            log.error("Error in AI ticket routing", e);
            // Fallback to simple keyword matching if AI fails
            return fallbackRouteTicket(title, description);
        }
        
        return result;
    }
    
    /**
     * Fallback method for ticket routing when AI fails
     * Uses simple keyword matching
     */
    private Map<String, Object> fallbackRouteTicket(String title, String description) {
        String combinedText = (title + " " + description).toLowerCase();
        
        Map<String, Object> result = new HashMap<>();
        
        if (combinedText.contains("computer") || 
            combinedText.contains("laptop") || 
            combinedText.contains("software") || 
            combinedText.contains("password") || 
            combinedText.contains("network") || 
            combinedText.contains("internet")) {
            
            result.put("department", Profile.Department.IT);
            result.put("confidenceScore", new BigDecimal("0.85"));
            result.put("reasoning", "Contains IT-related keywords like computer, software, network");
            
        } else if (combinedText.contains("salary") || 
                  combinedText.contains("leave") || 
                  combinedText.contains("vacation") || 
                  combinedText.contains("benefits") || 
                  combinedText.contains("hr") || 
                  combinedText.contains("payroll")) {
            
            result.put("department", Profile.Department.HR);
            result.put("confidenceScore", new BigDecimal("0.90"));
            result.put("reasoning", "Contains HR-related keywords like salary, leave, benefits");
            
        } else {
            result.put("department", Profile.Department.ADMIN);
            result.put("confidenceScore", new BigDecimal("0.70"));
            result.put("reasoning", "No specific department keywords found, routing to Admin as default");
        }
        
        return result;
    }

    /**
     * Generates AI-powered response suggestions for a ticket
     *
     * @param ticketTitle Ticket title
     * @param ticketDescription Ticket description
     * @param previousResponses List of previous responses in the ticket thread
     * @return List of suggested responses
     */
    public List<String> generateResponseSuggestions(String ticketTitle, String ticketDescription, List<String> previousResponses) {
        try {
            // Construct prompt for Gemini API
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append(String.format(
                "Generate 3 helpful, professional response suggestions for a support agent responding to this helpdesk ticket:\n\n" +
                "Ticket Title: %s\n" +
                "Ticket Description: %s\n", ticketTitle, ticketDescription));
            
            // Add previous responses context if available
            if (previousResponses != null && !previousResponses.isEmpty()) {
                promptBuilder.append("\n\nPrevious responses in this ticket thread:\n");
                for (int i = 0; i < previousResponses.size(); i++) {
                    promptBuilder.append("Response %d: %s\n".formatted(i + 1, previousResponses.get(i)));
                }
            }
            
            promptBuilder.append("""
                
                Respond with a JSON array containing exactly 3 response suggestions. Each suggestion should be:
                - Professional and helpful
                - Specific to the ticket content
                - Between 2-5 sentences
                - Include a clear next step or action item
                
                Example response format:
                [
                  "Thank you for reporting this issue. I've checked our system and can see that your account needs a password reset. Please check your email for reset instructions I've just sent.",
                  "I understand you're having trouble accessing your account. I've reset your password and sent instructions to your registered email address. Please let me know if you're able to log in now.",
                  "I've looked into your account access issue and have reset your credentials. You should receive an email shortly with instructions. If you don't receive it within 10 minutes, please check your spam folder and let me know."
                ]
                """);
            
            String prompt = promptBuilder.toString();
            JsonNode responseJson = geminiApiClient.generateStructuredContent(prompt);
            
            if (responseJson != null && responseJson.isArray()) {
                List<String> suggestions = new ArrayList<>();
                for (JsonNode suggestion : responseJson) {
                    suggestions.add(suggestion.asText());
                }
                
                // Ensure we have at least one suggestion
                if (!suggestions.isEmpty()) {
                    return suggestions;
                }
            }
            
            // Fallback to generic responses if AI fails
            return fallbackResponseSuggestions(ticketTitle, ticketDescription);
            
        } catch (Exception e) {
            log.error("Error generating response suggestions", e);
            // Fallback to generic responses if AI fails
            return fallbackResponseSuggestions(ticketTitle, ticketDescription);
        }
    }
    
    /**
     * Fallback method for response suggestions when AI fails
     * Returns generic responses based on keywords
     */
    private List<String> fallbackResponseSuggestions(String ticketTitle, String ticketDescription) {
        String combinedText = (ticketTitle + " " + ticketDescription).toLowerCase();
        
        if (combinedText.contains("password") || combinedText.contains("reset")) {
            return List.of(
                "I can help you reset your password. Please visit our self-service portal at https://helpdesk.company.com/reset-password and follow the instructions.",
                "To reset your password, you'll need to provide your employee ID and answer your security questions. Would you like me to guide you through the process?",
                "I've initiated a password reset for your account. You should receive an email with instructions shortly. Please check your inbox and spam folder."
            );
        } else if (combinedText.contains("software") || combinedText.contains("install")) {
            return List.of(
                "I can help you install the required software. Please provide your computer's asset tag number so I can verify permissions.",
                "For software installation, we'll need to schedule a remote session. What times would work for you in the next 2 business days?",
                "I've created a software installation ticket for you. A technician will contact you within 24 hours to assist with the installation."
            );
        } else if (combinedText.contains("leave") || combinedText.contains("vacation")) {
            return List.of(
                "To apply for leave, please use the HR portal at https://hr.company.com/leave-request. Your manager will be notified automatically.",
                "I can see your leave balance is currently 15 days. Would you like me to help you submit a leave request?",
                "I've forwarded your leave request to your manager for approval. You'll receive a notification once it's been processed."
            );
        } else {
            return List.of(
                "Thank you for your request. I've assigned it to the appropriate team, and someone will get back to you within 24 hours.",
                "I've received your ticket and am looking into it. Could you provide more details about when this issue started?",
                "Your request has been logged in our system. A support agent will contact you shortly to assist with your issue."
            );
        }
    }

    /**
     * Detects patterns in ticket data for proactive issue resolution
     *
     * @param recentTickets List of recent ticket descriptions
     * @return Map containing detected pattern and affected systems
     */
    public Map<String, Object> detectPatterns(List<String> recentTickets) {
        try {
            if (recentTickets == null || recentTickets.isEmpty()) {
                Map<String, Object> emptyResult = new HashMap<>();
                emptyResult.put("patternDetected", false);
                emptyResult.put("reason", "No tickets provided for analysis");
                return emptyResult;
            }
            
            // Construct prompt for Gemini API
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append(
                "Analyze the following helpdesk tickets to identify any patterns or recurring issues:\n\n" +
                "Recent Tickets:\n");
            
            // Add ticket descriptions
            for (int i = 0; i < recentTickets.size(); i++) {
                promptBuilder.append("Ticket %d: %s\n".formatted(i + 1, recentTickets.get(i)));
            }
            
            promptBuilder.append("""
                
                Identify if there are any patterns or recurring issues in these tickets.
                Respond with a JSON object containing:
                
                1. "patternDetected": boolean (true/false)
                2. If patternDetected is true, include:
                   - "issueType": The type of issue identified (e.g., "network", "email", "software")
                   - "occurrences": Number of tickets related to this issue
                   - "confidence": A number between 0 and 1 indicating your confidence in this pattern
                   - "suggestedAction": What action should be taken to address this issue
                   - "affectedSystems": Array of potentially affected systems
                3. If patternDetected is false, include:
                   - "reason": Why no pattern was detected
                
                Example response format:
                {
                  "patternDetected": true,
                  "issueType": "network",
                  "occurrences": 5,
                  "confidence": 0.85,
                  "suggestedAction": "Investigate potential network outage or performance issues",
                  "affectedSystems": ["Corporate Network", "Internet Gateway", "DNS Servers"]
                }
                
                OR
                
                {
                  "patternDetected": false,
                  "reason": "Tickets cover diverse unrelated issues with no clear pattern"
                }
                """);
            
            String prompt = promptBuilder.toString();
            JsonNode responseJson = geminiApiClient.generateStructuredContent(prompt);
            
            if (responseJson != null) {
                Map<String, Object> result = new HashMap<>();
                
                boolean patternDetected = responseJson.path("patternDetected").asBoolean(false);
                result.put("patternDetected", patternDetected);
                
                if (patternDetected) {
                    result.put("issueType", responseJson.path("issueType").asText());
                    result.put("occurrences", responseJson.path("occurrences").asInt());
                    result.put("confidence", responseJson.path("confidence").asDouble());
                    result.put("suggestedAction", responseJson.path("suggestedAction").asText());
                    
                    // Convert affected systems array to List
                    List<String> affectedSystems = new ArrayList<>();
                    JsonNode systemsNode = responseJson.path("affectedSystems");
                    if (systemsNode.isArray()) {
                        for (JsonNode system : systemsNode) {
                            affectedSystems.add(system.asText());
                        }
                    }
                    result.put("affectedSystems", affectedSystems);
                } else {
                    result.put("reason", responseJson.path("reason").asText("No clear pattern detected"));
                }
                
                return result;
            }
            
            // Fallback to simple pattern detection if AI fails
            return fallbackPatternDetection(recentTickets);
            
        } catch (Exception e) {
            log.error("Error detecting patterns", e);
            // Fallback to simple pattern detection if AI fails
            return fallbackPatternDetection(recentTickets);
        }
    }
    
    /**
     * Fallback method for pattern detection when AI fails
     * Uses simple keyword counting approach
     */
    private Map<String, Object> fallbackPatternDetection(List<String> recentTickets) {
        Map<String, Integer> keywordCounts = new HashMap<>();
        
        for (String ticket : recentTickets) {
            String lowerTicket = ticket.toLowerCase();
            
            if (lowerTicket.contains("network") || lowerTicket.contains("internet") || lowerTicket.contains("connection")) {
                keywordCounts.put("network", keywordCounts.getOrDefault("network", 0) + 1);
            }
            
            if (lowerTicket.contains("email") || lowerTicket.contains("outlook")) {
                keywordCounts.put("email", keywordCounts.getOrDefault("email", 0) + 1);
            }
            
            if (lowerTicket.contains("vpn") || lowerTicket.contains("remote access")) {
                keywordCounts.put("vpn", keywordCounts.getOrDefault("vpn", 0) + 1);
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        
        // Find the most common issue
        String mostCommonIssue = null;
        int maxCount = 0;
        
        for (Map.Entry<String, Integer> entry : keywordCounts.entrySet()) {
            if (entry.getValue() > maxCount && entry.getValue() >= 3) { // At least 3 occurrences to be considered a pattern
                mostCommonIssue = entry.getKey();
                maxCount = entry.getValue();
            }
        }
        
        if (mostCommonIssue != null) {
            result.put("patternDetected", true);
            result.put("issueType", mostCommonIssue);
            result.put("occurrences", maxCount);
            result.put("confidence", (double) maxCount / recentTickets.size());
            
            switch (mostCommonIssue) {
                case "network":
                    result.put("suggestedAction", "Investigate potential network outage or performance issues");
                    result.put("affectedSystems", List.of("Corporate Network", "Internet Gateway", "DNS Servers"));
                    break;
                case "email":
                    result.put("suggestedAction", "Check email server status and recent changes");
                    result.put("affectedSystems", List.of("Exchange Server", "Email Gateway", "Spam Filter"));
                    break;
                case "vpn":
                    result.put("suggestedAction", "Verify VPN service status and connection logs");
                    result.put("affectedSystems", List.of("VPN Server", "Authentication Service", "Remote Access Gateway"));
                    break;
            }
        } else {
            result.put("patternDetected", false);
            result.put("reason", "No clear pattern detected in the provided tickets");
        }
        
        return result;
    }
}
