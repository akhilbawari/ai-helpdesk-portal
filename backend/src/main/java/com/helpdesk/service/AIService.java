package com.helpdesk.service;

import com.google.cloud.aiplatform.v1.PredictionServiceClient;
import com.google.cloud.aiplatform.v1.PredictionServiceSettings;
import com.helpdesk.model.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIService {

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    /**
     * Analyzes ticket content and suggests the appropriate department
     *
     * @param title Ticket title
     * @param description Ticket description
     * @return Map containing department, confidence score, and reasoning
     */
    public Map<String, Object> routeTicket(String title, String description) {
        // In a real implementation, this would call the Gemini API
        // For now, we'll use a simple keyword-based approach
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
        // In a real implementation, this would call the Gemini API
        // For now, we'll return some generic responses based on keywords
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
        // In a real implementation, this would use the Gemini API for pattern detection
        // For now, we'll use a simple keyword counting approach
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
        }
        
        return result;
    }
}
