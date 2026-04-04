package com.touristconnect.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ReportDTO {

    public static class InvoiceSummaryDTO {
        private String invoiceNumber;
        private LocalDateTime date;
        private String customerName;
        private Double amount;
        private String status;

        public InvoiceSummaryDTO(String invoiceNumber, LocalDateTime date, String customerName, Double amount,
                String status) {
            this.invoiceNumber = invoiceNumber;
            this.date = date;
            this.customerName = customerName;
            this.amount = amount;
            this.status = status;
        }

        // Getters and Setters
        public String getInvoiceNumber() {
            return invoiceNumber;
        }

        public void setInvoiceNumber(String invoiceNumber) {
            this.invoiceNumber = invoiceNumber;
        }

        public LocalDateTime getDate() {
            return date;
        }

        public void setDate(LocalDateTime date) {
            this.date = date;
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public Double getAmount() {
            return amount;
        }

        public void setAmount(Double amount) {
            this.amount = amount;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class FinancialSummaryDTO {
        private Long totalInvoices;
        private Double totalRevenue;
        private Double totalCommission;
        private Double totalGuidePayout;

        public FinancialSummaryDTO() {
        }

        public FinancialSummaryDTO(Long totalInvoices, Double totalRevenue, Double totalCommission,
                Double totalGuidePayout) {
            this.totalInvoices = totalInvoices;
            this.totalRevenue = totalRevenue;
            this.totalCommission = totalCommission;
            this.totalGuidePayout = totalGuidePayout;
        }

        // Getters and Setters
        public Long getTotalInvoices() {
            return totalInvoices;
        }

        public void setTotalInvoices(Long totalInvoices) {
            this.totalInvoices = totalInvoices;
        }

        public Double getTotalRevenue() {
            return totalRevenue;
        }

        public void setTotalRevenue(Double totalRevenue) {
            this.totalRevenue = totalRevenue;
        }

        public Double getTotalCommission() {
            return totalCommission;
        }

        public void setTotalCommission(Double totalCommission) {
            this.totalCommission = totalCommission;
        }

        public Double getTotalGuidePayout() {
            return totalGuidePayout;
        }

        public void setTotalGuidePayout(Double totalGuidePayout) {
            this.totalGuidePayout = totalGuidePayout;
        }
    }

    public static class DailyReportDTO {
        private FinancialSummaryDTO summary;
        private List<InvoiceSummaryDTO> invoices;

        public DailyReportDTO(FinancialSummaryDTO summary, List<InvoiceSummaryDTO> invoices) {
            this.summary = summary;
            this.invoices = invoices;
        }

        public FinancialSummaryDTO getSummary() {
            return summary;
        }

        public void setSummary(FinancialSummaryDTO summary) {
            this.summary = summary;
        }

        public List<InvoiceSummaryDTO> getInvoices() {
            return invoices;
        }

        public void setInvoices(List<InvoiceSummaryDTO> invoices) {
            this.invoices = invoices;
        }
    }

    public static class MonthlyReportDTO {
        private FinancialSummaryDTO summary;
        private List<InvoiceSummaryDTO> invoices;

        public MonthlyReportDTO(FinancialSummaryDTO summary, List<InvoiceSummaryDTO> invoices) {
            this.summary = summary;
            this.invoices = invoices;
        }

        public FinancialSummaryDTO getSummary() {
            return summary;
        }

        public void setSummary(FinancialSummaryDTO summary) {
            this.summary = summary;
        }

        public List<InvoiceSummaryDTO> getInvoices() {
            return invoices;
        }

        public void setInvoices(List<InvoiceSummaryDTO> invoices) {
            this.invoices = invoices;
        }
    }

    public static class YearlyReportDTO {
        private FinancialSummaryDTO summary;
        private List<InvoiceSummaryDTO> invoices;

        public YearlyReportDTO(FinancialSummaryDTO summary, List<InvoiceSummaryDTO> invoices) {
            this.summary = summary;
            this.invoices = invoices;
        }

        public FinancialSummaryDTO getSummary() {
            return summary;
        }

        public void setSummary(FinancialSummaryDTO summary) {
            this.summary = summary;
        }

        public List<InvoiceSummaryDTO> getInvoices() {
            return invoices;
        }

        public void setInvoices(List<InvoiceSummaryDTO> invoices) {
            this.invoices = invoices;
        }
    }
}
