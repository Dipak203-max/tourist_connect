package com.touristconnect.repository;

import com.touristconnect.entity.Payment;
import com.touristconnect.entity.PaymentStatus;
import com.touristconnect.dto.ReportDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Payment, Long> {

        @Query("SELECT new com.touristconnect.dto.ReportDTO$FinancialSummaryDTO(" +
                        "COUNT(p), SUM(p.amount), SUM(p.commissionAmount), SUM(p.guideAmount)) " +
                        "FROM Payment p JOIN Booking b ON p.bookingId = b.id " +
                        "WHERE p.status = :status AND b.date BETWEEN :start AND :end")
        ReportDTO.FinancialSummaryDTO getFinancialSummary(
                        @Param("status") PaymentStatus status,
                        @Param("start") java.time.LocalDate start,
                        @Param("end") java.time.LocalDate end);

        @Query("SELECT new com.touristconnect.dto.ReportDTO$InvoiceSummaryDTO(" +
                        "p.invoiceNumber, p.createdAt, u.fullName, p.amount, CAST(p.status AS string)) " +
                        "FROM Payment p JOIN User u ON p.userId = u.id " +
                        "JOIN Booking b ON p.bookingId = b.id " +
                        "WHERE p.status = :status AND b.date BETWEEN :start AND :end " +
                        "ORDER BY b.date DESC, p.createdAt DESC")
        List<ReportDTO.InvoiceSummaryDTO> getInvoiceSummaries(
                        @Param("status") PaymentStatus status,
                        @Param("start") java.time.LocalDate start,
                        @Param("end") java.time.LocalDate end);

        @Query("SELECT new com.touristconnect.dto.GuideReportDTO$FinancialSummaryDTO(" +
                        "COUNT(p), SUM(p.amount), SUM(p.commissionAmount), SUM(p.guideAmount)) " +
                        "FROM Payment p JOIN Booking b ON p.bookingId = b.id " +
                        "WHERE (p.status IN :statuses) AND b.guide.email = :email AND b.date BETWEEN :start AND :end")
        com.touristconnect.dto.GuideReportDTO.FinancialSummaryDTO getGuideFinancialSummary(
                        @Param("email") String email,
                        @Param("statuses") List<PaymentStatus> statuses,
                        @Param("start") java.time.LocalDate start,
                        @Param("end") java.time.LocalDate end);

        @Query("SELECT new com.touristconnect.dto.GuideReportDTO$BookingSummaryDTO(" +
                        "p.invoiceNumber, p.createdAt, u.fullName, p.amount, CAST(p.status AS string)) " +
                        "FROM Payment p JOIN User u ON p.userId = u.id " +
                        "JOIN Booking b ON p.bookingId = b.id " +
                        "WHERE (p.status IN :statuses) AND b.guide.email = :email AND b.date BETWEEN :start AND :end "
                        +
                        "ORDER BY b.date DESC, p.createdAt DESC")
        List<com.touristconnect.dto.GuideReportDTO.BookingSummaryDTO> getGuideBookingSummaries(
                        @Param("email") String email,
                        @Param("statuses") List<PaymentStatus> statuses,
                        @Param("start") java.time.LocalDate start,
                        @Param("end") java.time.LocalDate end);
}
