package com.touristconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminChartDataDTO {
    private List<ChartDataPoint> revenueData;
    private List<ChartDataPoint> bookingData;
    private List<ChartDataPoint> userData;
    private List<PieDataPoint> guideApprovalData;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChartDataPoint {
        private String label; 
        private Double value;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PieDataPoint {
        private String name;
        private Long value;
    }
}
