package com.touristconnect.controller;

import com.touristconnect.dto.AdminChartDataDTO;
import com.touristconnect.dto.AdminFinancialStatsDTO;
import com.touristconnect.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/activity")
    public ResponseEntity<?> getActivity() {
        return ResponseEntity.ok(dashboardService.getRecentActivities());
    }

    @GetMapping("/charts")
    public ResponseEntity<AdminChartDataDTO> getChartData() {
        return ResponseEntity.ok(dashboardService.getChartData());
    }

    @GetMapping("/financial-summary")
    public ResponseEntity<AdminFinancialStatsDTO> getFinancialSummary(
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {
        
        java.time.LocalDate startDate = start != null ? java.time.LocalDate.parse(start) : null;
        java.time.LocalDate endDate = end != null ? java.time.LocalDate.parse(end) : null;
        
        return ResponseEntity.ok(dashboardService.getFinancialSummary(startDate, endDate));
    }
}
