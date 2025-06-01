package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for dashboard metrics and analytics
 */
@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
public class    DashboardController {

    private final DashboardService dashboardService;

    /**
     * Get overview metrics for the dashboard
     *
     * @return Dashboard overview metrics
     */
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardOverview() {
        log.info("Fetching dashboard overview metrics");
        Map<String, Object> metrics = dashboardService.getDashboardOverview();
        return ResponseEntity.ok(ApiResponse.success(metrics, "Dashboard overview metrics retrieved"));
    }

    /**
     * Get recent ticket activity
     *
     * @param limit Maximum number of activities to return (default: 10)
     * @return List of recent activities
     */
    @GetMapping("/recent-activity")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Fetching recent activity with limit: {}", limit);
        List<Map<String, Object>> activities = dashboardService.getRecentActivity(limit);
        return ResponseEntity.ok(ApiResponse.success(activities, "Recent activities retrieved"));
    }

    /**
     * Get AI-detected patterns from recent tickets
     *
     * @param days Number of days to look back (default: 30)
     * @return Detected patterns
     */
    @GetMapping("/patterns")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTicketPatterns(
            @RequestParam(defaultValue = "30") int days) {
        
        log.info("Analyzing ticket patterns for the last {} days", days);
        Map<String, Object> patterns = dashboardService.getTicketPatterns(days);
        return ResponseEntity.ok(ApiResponse.success(patterns, "Ticket patterns analyzed"));
    }

    /**
     * Get performance metrics by department
     *
     * @return Department performance metrics
     */
    @GetMapping("/department-performance")
    public ResponseEntity<ApiResponse<Map<String, Map<String, Object>>>> getDepartmentPerformance() {
        log.info("Fetching department performance metrics");
        Map<String, Map<String, Object>> metrics = dashboardService.getDepartmentPerformance();
        return ResponseEntity.ok(ApiResponse.success(metrics, "Department performance metrics retrieved"));
    }
}
