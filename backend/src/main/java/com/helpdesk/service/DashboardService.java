package com.helpdesk.service;

import com.helpdesk.model.Profile;
import com.helpdesk.model.Ticket;
import com.helpdesk.model.TicketResponse;
import com.helpdesk.repository.TicketRepository;
import com.helpdesk.repository.TicketResponseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for generating dashboard metrics and analytics
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final TicketResponseRepository responseRepository;
    private final AIService aiService;

    /**
     * Get overview metrics for the dashboard
     *
     * @return Map containing various metrics
     */
    public Map<String, Object> getDashboardOverview() {
        Map<String, Object> metrics = new HashMap<>();
        List<Ticket> allTickets = ticketRepository.findAll();
        
        // Count tickets by status
        Map<Ticket.Status, Long> ticketsByStatus = allTickets.stream()
                .collect(Collectors.groupingBy(Ticket::getStatus, Collectors.counting()));
        
        // Count tickets by department
        Map<Profile.Department, Long> ticketsByDepartment = allTickets.stream()
                .filter(ticket -> ticket.getCategory() != null)
                .collect(Collectors.groupingBy(Ticket::getCategory, Collectors.counting()));
        
        // Count tickets by priority
        Map<Ticket.Priority, Long> ticketsByPriority = allTickets.stream()
                .collect(Collectors.groupingBy(Ticket::getPriority, Collectors.counting()));
        
        // Calculate average resolution time for resolved tickets
        OptionalDouble avgResolutionTime = allTickets.stream()
                .filter(ticket -> ticket.getStatus() == Ticket.Status.RESOLVED && ticket.getResolvedAt() != null && ticket.getCreatedAt() != null)
                .mapToLong(ticket -> Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()).toHours())
                .average();
        
        // Calculate AI routing accuracy (tickets with confidence score > 0.7)
        long highConfidenceTickets = allTickets.stream()
                .filter(ticket -> ticket.getAiConfidenceScore() != null && ticket.getAiConfidenceScore().compareTo(new BigDecimal("0.7")) > 0)
                .count();
        
        double aiRoutingAccuracy = allTickets.isEmpty() ? 0 : (double) highConfidenceTickets / allTickets.size();
        
        // Compile metrics
        metrics.put("totalTickets", allTickets.size());
        metrics.put("ticketsByStatus", ticketsByStatus);
        metrics.put("ticketsByDepartment", ticketsByDepartment);
        metrics.put("ticketsByPriority", ticketsByPriority);
        metrics.put("averageResolutionTimeHours", avgResolutionTime.orElse(0));
        metrics.put("aiRoutingAccuracy", aiRoutingAccuracy);
        
        return metrics;
    }

    /**
     * Get recent ticket activity for the dashboard
     *
     * @param limit Maximum number of activities to return
     * @return List of recent ticket activities
     */
    public List<Map<String, Object>> getRecentActivity(int limit) {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // Get recent tickets
        List<Ticket> recentTickets = ticketRepository.findAll().stream()
                .sorted(Comparator.comparing(Ticket::getCreatedAt).reversed())
                .limit(limit)
                .collect(Collectors.toList());
        
        for (Ticket ticket : recentTickets) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("type", "TICKET_CREATED");
            activity.put("ticket", ticket);
            activity.put("timestamp", ticket.getCreatedAt());
            activities.add(activity);
        }
        
        // Get recent responses
        List<TicketResponse> recentResponses = responseRepository.findAll().stream()
                .sorted(Comparator.comparing(TicketResponse::getCreatedAt).reversed())
                .limit(limit)
                .collect(Collectors.toList());
        
        for (TicketResponse response : recentResponses) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("type", "RESPONSE_ADDED");
            activity.put("response", response);
            activity.put("ticket", response.getTicket());
            activity.put("timestamp", response.getCreatedAt());
            activities.add(activity);
        }
        
        // Sort all activities by timestamp
        activities.sort((a1, a2) -> {
            OffsetDateTime t1 = (OffsetDateTime) a1.get("timestamp");
            OffsetDateTime t2 = (OffsetDateTime) a2.get("timestamp");
            return t2.compareTo(t1); // Descending order
        });
        
        // Limit to requested number
        return activities.stream().limit(limit).collect(Collectors.toList());
    }

    /**
     * Get AI-detected patterns from recent tickets
     *
     * @param days Number of days to look back
     * @return Map containing detected patterns
     */
    public Map<String, Object> getTicketPatterns(int days) {
        OffsetDateTime cutoffDate = OffsetDateTime.now().minusDays(days);
        
        // Get tickets from the specified period
        List<Ticket> recentTickets = ticketRepository.findAll().stream()
                .filter(ticket -> ticket.getCreatedAt() != null && ticket.getCreatedAt().isAfter(cutoffDate))
                .collect(Collectors.toList());
        
        // Extract ticket descriptions for pattern detection
        List<String> ticketDescriptions = recentTickets.stream()
                .map(Ticket::getDescription)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        
        // Use AI service to detect patterns
        if (ticketDescriptions.isEmpty()) {
            Map<String, Object> emptyResult = new HashMap<>();
            emptyResult.put("patterns", Collections.emptyList());
            emptyResult.put("count", 0);
            return emptyResult;
        }
        
        try {
            return aiService.detectPatterns(ticketDescriptions);
        } catch (Exception e) {
            log.error("Error detecting patterns in tickets", e);
            Map<String, Object> fallbackResult = new HashMap<>();
            fallbackResult.put("patterns", Collections.emptyList());
            fallbackResult.put("count", 0);
            fallbackResult.put("error", "Failed to detect patterns: " + e.getMessage());
            return fallbackResult;
        }
    }

    /**
     * Get performance metrics by department
     *
     * @return Map of department performance metrics
     */
    public Map<String, Map<String, Object>> getDepartmentPerformance() {
        Map<String, Map<String, Object>> departmentMetrics = new HashMap<>();
        List<Ticket> allTickets = ticketRepository.findAll();
        
        // Group tickets by department
        Map<Profile.Department, List<Ticket>> ticketsByDept = allTickets.stream()
                .filter(ticket -> ticket.getCategory() != null)
                .collect(Collectors.groupingBy(Ticket::getCategory));
        
        for (Map.Entry<Profile.Department, List<Ticket>> entry : ticketsByDept.entrySet()) {
            Profile.Department dept = entry.getKey();
            List<Ticket> deptTickets = entry.getValue();
            
            Map<String, Object> metrics = new HashMap<>();
            
            // Count tickets by status for this department
            Map<Ticket.Status, Long> statusCounts = deptTickets.stream()
                    .collect(Collectors.groupingBy(Ticket::getStatus, Collectors.counting()));
            
            // Calculate average resolution time
            OptionalDouble avgResolutionTime = deptTickets.stream()
                    .filter(ticket -> ticket.getStatus() == Ticket.Status.RESOLVED && 
                            ticket.getResolvedAt() != null && ticket.getCreatedAt() != null)
                    .mapToLong(ticket -> Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()).toHours())
                    .average();
            
            // Calculate percentage of high priority tickets
            long highPriorityCount = deptTickets.stream()
                    .filter(ticket -> ticket.getPriority() == Ticket.Priority.HIGH || 
                            ticket.getPriority() == Ticket.Priority.CRITICAL)
                    .count();
            
            double highPriorityPercentage = deptTickets.isEmpty() ? 0 : 
                    (double) highPriorityCount / deptTickets.size() * 100;
            
            // Compile metrics
            metrics.put("totalTickets", deptTickets.size());
            metrics.put("statusCounts", statusCounts);
            metrics.put("averageResolutionTimeHours", avgResolutionTime.orElse(0));
            metrics.put("highPriorityPercentage", highPriorityPercentage);
            
            departmentMetrics.put(dept.name(), metrics);
        }
        
        return departmentMetrics;
    }
}
