package com.touristconnect.service;

import com.touristconnect.dto.AdminActivityDTO;
import com.touristconnect.dto.AdminChartDataDTO;
import com.touristconnect.dto.AdminDashboardStatsDTO;
import com.touristconnect.dto.AdminFinancialStatsDTO;
import com.touristconnect.entity.AdminActivityLog;
import com.touristconnect.entity.AdminActivityType;
import com.touristconnect.entity.Payment;
import com.touristconnect.entity.PaymentStatus;
import com.touristconnect.entity.Role;
import com.touristconnect.entity.User;
import com.touristconnect.entity.VerificationStatus;
import com.touristconnect.repository.*;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final AdminActivityLogRepository activityLogRepository;

    public AdminDashboardStatsDTO getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime fourteenDaysAgo = now.minusDays(14);

        // Current Stats
        long totalUsers = userRepository.count();
        long totalBookings = bookingRepository.count();
        
        AdminFinancialStatsDTO financialStats = getFinancialSummary(null, null);
        double totalRevenue = financialStats.getTotalRevenue();
        
        long activeGuides = userRepository.countByRole(Role.GUIDE);
        long pendingVerifications = userRepository.countByVerificationStatus(VerificationStatus.PENDING);

        // Growth Calculation (comparing last 7 days with the 7 days before that)
        long usersLast7 = userRepository.countByCreatedAtAfter(sevenDaysAgo);
        long usersPrev7 = userRepository.countByCreatedAtAfter(fourteenDaysAgo) - usersLast7;
        double usersGrowth = calculateGrowth(usersLast7, usersPrev7);

        long bookingsLast7 = bookingRepository.countByCreatedAtAfter(sevenDaysAgo);
        long bookingsPrev7 = bookingRepository.countByCreatedAtAfter(fourteenDaysAgo) - bookingsLast7;
        double bookingsGrowth = calculateGrowth(bookingsLast7, bookingsPrev7);

        Double revenueLast7 = paymentRepository.sumAmountByStatusAndCreatedAtAfter(PaymentStatus.SUCCESS, sevenDaysAgo);
        Double revenuePrev7 = paymentRepository.sumAmountByStatusAndCreatedAtBetween(PaymentStatus.SUCCESS, fourteenDaysAgo, sevenDaysAgo);
        double revenueGrowth = calculateGrowth(revenueLast7 != null ? revenueLast7 : 0.0, revenuePrev7 != null ? revenuePrev7 : 0.0);

        long guidesLast7 = userRepository.countByRoleAndCreatedAtAfter(Role.GUIDE, sevenDaysAgo);
        // Simplified guide growth
        double guidesGrowth = calculateGrowth(guidesLast7, 0); 

        // Trend data for sparklines 
        Double[] revenueTrend = new Double[7];
        Long[] bookingTrend = new Long[7];
        for (int i = 0; i < 7; i++) {
            LocalDateTime start = now.minusDays(6 - i).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime end = start.withHour(23).withMinute(59).withSecond(59);
            Double dayRev = paymentRepository.sumAmountByStatusAndCreatedAtBetween(PaymentStatus.SUCCESS, start, end);
            revenueTrend[i] = dayRev != null ? dayRev : 0.0;
            bookingTrend[i] = bookingRepository.countByCreatedAtBetween(start, end);
        }

        return new AdminDashboardStatsDTO(
                totalUsers, totalBookings, totalRevenue, activeGuides, pendingVerifications,
                usersGrowth, bookingsGrowth, revenueGrowth, guidesGrowth,
                revenueTrend, bookingTrend
        );
    }

    public AdminFinancialStatsDTO getFinancialSummary(LocalDate start, LocalDate end) {
        // Fallback to wide range if not provided
        if (start == null) start = LocalDate.of(2000, 1, 1);
        if (end == null) end = LocalDate.now().plusYears(1);

        Double revenue = paymentRepository.sumAmountByStatusAndBookingDateBetween(PaymentStatus.SUCCESS, start, end);
        Double commission = paymentRepository.sumCommissionByStatusAndBookingDateBetween(PaymentStatus.SUCCESS, start, end);
        Double payout = paymentRepository.sumGuideAmountByStatusAndBookingDateBetween(PaymentStatus.SUCCESS, start, end);
        long failed = paymentRepository.countByStatusAndBookingDateBetween(PaymentStatus.FAILED, start, end);
        long totalInvoices = paymentRepository.countByStatusAndBookingDateBetween(PaymentStatus.SUCCESS, start, end);

        return new AdminFinancialStatsDTO(
                revenue != null ? revenue : 0.0,
                commission != null ? commission : 0.0,
                payout != null ? payout : 0.0,
                failed,
                totalInvoices
        );
    }

    public Page<Payment> getFilteredPayments(PaymentStatus status, Pageable pageable) {
        return paymentRepository.findAllFiltered(status, pageable);
    }

    public List<AdminActivityDTO> getRecentActivities() {
        return activityLogRepository.findTop20ByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AdminChartDataDTO getChartData() {
        // Last 30 days revenue and bookings
        List<AdminChartDataDTO.ChartDataPoint> revenueData = new ArrayList<>();
        List<AdminChartDataDTO.ChartDataPoint> bookingData = new ArrayList<>();
        List<AdminChartDataDTO.ChartDataPoint> userData = new ArrayList<>();

        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        for (int i = 29; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = date.atTime(23, 59, 59);

            Double rev = paymentRepository.sumAmountByStatusAndCreatedAtBetween(PaymentStatus.SUCCESS, start, end);
            revenueData.add(new AdminChartDataDTO.ChartDataPoint(date.format(formatter), rev != null ? rev : 0.0));

            long bookings = bookingRepository.countByCreatedAtBetween(start, end);
            bookingData.add(new AdminChartDataDTO.ChartDataPoint(date.format(formatter), (double) bookings));

            long dailyUsers = userRepository.countByCreatedAtBetween(start, end);
            userData.add(new AdminChartDataDTO.ChartDataPoint(date.format(formatter), (double) dailyUsers));
        }

        List<AdminChartDataDTO.PieDataPoint> guideApprovalData = new ArrayList<>();
        guideApprovalData.add(new AdminChartDataDTO.PieDataPoint("Verified", userRepository.countByVerificationStatus(VerificationStatus.VERIFIED)));
        guideApprovalData.add(new AdminChartDataDTO.PieDataPoint("Pending", userRepository.countByVerificationStatus(VerificationStatus.PENDING)));
        guideApprovalData.add(new AdminChartDataDTO.PieDataPoint("Rejected", userRepository.countByVerificationStatus(VerificationStatus.REJECTED)));

        return new AdminChartDataDTO(revenueData, bookingData, userData, guideApprovalData);
    }

    public void logActivity(AdminActivityType type, String description, User user, String referenceId) {
        AdminActivityLog log = AdminActivityLog.builder()
                .type(type)
                .description(description)
                .user(user)
                .referenceId(referenceId)
                .build();
        activityLogRepository.save(log);
    }

    private double calculateGrowth(double current, double previous) {
        if (previous == 0) return current > 0 ? 100.0 : 0.0;
        return ((current - previous) / previous) * 100.0;
    }

    private AdminActivityDTO convertToDTO(AdminActivityLog log) {
        return new AdminActivityDTO(
                log.getId(),
                log.getType(),
                log.getDescription(),
                log.getUser() != null ? log.getUser().getFullName() : "System",
                log.getUser() != null ? log.getUser().getEmail() : null,
                log.getReferenceId(),
                log.getCreatedAt()
        );
    }

    public byte[] generateDashboardSummaryPdf() {
        AdminDashboardStatsDTO stats = getDashboardStats();
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font styles
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.DARK_GRAY);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);

            // Header
            Paragraph header = new Paragraph("TouristConnect System Summary", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            header.setSpacingAfter(10);
            document.add(header);

            Paragraph subtitle = new Paragraph("Platform Dashboard Status Report", subHeaderFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(30);
            document.add(subtitle);

            // KPI Grid
            PdfPTable kpiTable = new PdfPTable(2);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(20);

            addKpiRow(kpiTable, "Total Users", String.valueOf(stats.getTotalUsers()), boldFont, normalFont);
            addKpiRow(kpiTable, "Total Revenue", String.format("NPR %.2f", stats.getTotalRevenue()), boldFont, normalFont);
            addKpiRow(kpiTable, "Total Bookings", String.valueOf(stats.getTotalBookings()), boldFont, normalFont);
            addKpiRow(kpiTable, "Active Guides", String.valueOf(stats.getActiveGuides()), boldFont, normalFont);
            addKpiRow(kpiTable, "Pending Verifications", String.valueOf(stats.getPendingVerifications()), boldFont, normalFont);

            document.add(kpiTable);

            // Growth Section
            Paragraph growthHeader = new Paragraph("7-Day Growth Metrics", subHeaderFont);
            growthHeader.setSpacingBefore(20);
            growthHeader.setSpacingAfter(10);
            document.add(growthHeader);

            PdfPTable growthTable = new PdfPTable(4);
            growthTable.setWidthPercentage(100);
            
            growthTable.addCell(createCell("Category", boldFont, Element.ALIGN_LEFT, true));
            growthTable.addCell(createCell("Growth %", boldFont, Element.ALIGN_CENTER, true));
            growthTable.addCell(createCell("Trend", boldFont, Element.ALIGN_CENTER, true));
            growthTable.addCell(createCell("Status", boldFont, Element.ALIGN_CENTER, true));

            addGrowthRow(growthTable, "User Base", stats.getUsersGrowth(), normalFont);
            addGrowthRow(growthTable, "Revenue", stats.getRevenueGrowth(), normalFont);
            addGrowthRow(growthTable, "Bookings", stats.getBookingsGrowth(), normalFont);
            addGrowthRow(growthTable, "Guides", stats.getGuidesGrowth(), normalFont);

            document.add(growthTable);

            // Footer
            Paragraph footer = new Paragraph("\nGenerated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), normalFont);
            footer.setAlignment(Element.ALIGN_RIGHT);
            document.add(footer);

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Dashboard PDF", e);
        }

        return out.toByteArray();
    }

    private void addKpiRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setPadding(10);
        labelCell.setBackgroundColor(new Color(245, 245, 245));
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setPadding(10);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }

    private void addGrowthRow(PdfPTable table, String label, double growth, Font font) {
        table.addCell(createCell(label, font, Element.ALIGN_LEFT, false));
        table.addCell(createCell(String.format("%.1f%%", growth), font, Element.ALIGN_CENTER, false));
        table.addCell(createCell(growth >= 0 ? "UP" : "DOWN", font, Element.ALIGN_CENTER, false));
        
        PdfPCell statusCell = new PdfPCell(new Phrase(growth >= 0 ? "POSITIVE" : "NEGATIVE", font));
        statusCell.setPadding(8);
        statusCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        statusCell.setBackgroundColor(growth >= 0 ? new Color(230, 255, 230) : new Color(255, 230, 230));
        table.addCell(statusCell);
    }

    private PdfPCell createCell(String text, Font font, int alignment, boolean header) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        cell.setHorizontalAlignment(alignment);
        if (header) {
            cell.setBackgroundColor(Color.LIGHT_GRAY);
        }
        return cell;
    }
}
