package com.touristconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GuideReportDTO {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FinancialSummaryDTO {
        private Long totalBookings;
        private Double totalRevenue;
        private Double totalCommission;
        private Double totalPayout;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BookingSummaryDTO {
        private String invoiceNumber;
        private LocalDateTime date;
        private String touristName;
        private Double amount;
        private String status;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyReportDTO {
        private FinancialSummaryDTO summary;
        private List<BookingSummaryDTO> bookings;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyReportDTO {
        private FinancialSummaryDTO summary;
        private List<BookingSummaryDTO> bookings;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class YearlyReportDTO {
        private FinancialSummaryDTO summary;
        private List<BookingSummaryDTO> bookings;
    }
}
