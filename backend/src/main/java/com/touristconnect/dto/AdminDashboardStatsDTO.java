package com.touristconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardStatsDTO {
    private long totalUsers;
    private long totalBookings;
    private double totalRevenue;
    private long activeGuides;
    private long pendingVerifications;

    // Growth rates (compared to last week/month)
    private double usersGrowth;
    private double bookingsGrowth;
    private double revenueGrowth;
    private double guidesGrowth;
    
    // Sparkline data (simple arrays of values)
    private Double[] revenueTrend;
    private Long[] bookingTrend;
}
