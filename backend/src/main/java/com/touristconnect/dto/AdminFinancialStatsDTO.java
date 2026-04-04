package com.touristconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminFinancialStatsDTO {
    private Double totalRevenue;
    private Double totalCommission;
    private Double totalGuidePayout;
    private Long failedCount;
    private Long totalInvoices;
}
