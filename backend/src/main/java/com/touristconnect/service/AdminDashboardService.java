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

        // Trend data for sparklines (last 7 days)
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
}
