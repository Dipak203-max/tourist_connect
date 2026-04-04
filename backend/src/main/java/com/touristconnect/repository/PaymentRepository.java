package com.touristconnect.repository;

import com.touristconnect.entity.Payment;
import com.touristconnect.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p " +
            "LEFT JOIN FETCH p.booking b " +
            "LEFT JOIN FETCH b.tourist " +
            "LEFT JOIN FETCH b.guide " +
            "LEFT JOIN FETCH b.destination " +
            "WHERE p.id = :id")
    Optional<Payment> findByIdWithBookingAndUsers(@Param("id") Long id);

    Optional<Payment> findByKhaltiPidx(String khaltiPidx);

    Optional<Payment> findByBookingId(Long bookingId);

    Page<Payment> findAllByStatus(PaymentStatus status, Pageable pageable);

    @Query(value = "SELECT p FROM Payment p " +
            "LEFT JOIN FETCH p.booking b " +
            "WHERE (:status IS NULL OR p.status = :status)",
            countQuery = "SELECT COUNT(p) FROM Payment p WHERE (:status IS NULL OR p.status = :status)")
    Page<Payment> findAllFiltered(@Param("status") PaymentStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.status = :status")
    Double sumAmountByStatus(@Param("status") PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.commissionAmount), 0.0) FROM Payment p WHERE p.status = :status")
    Double sumCommissionByStatus(@Param("status") PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.guideAmount), 0.0) FROM Payment p WHERE p.status = :status")
    Double sumGuideAmountByStatus(@Param("status") PaymentStatus status);

    long countByStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p")
    Double sumAllAmount();

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p " +
            "LEFT JOIN p.booking b " +
            "WHERE p.status = :status AND b.date BETWEEN :start AND :end")
    Double sumAmountByStatusAndBookingDateBetween(@Param("status") PaymentStatus status, @Param("start") java.time.LocalDate start, @Param("end") java.time.LocalDate end);

    @Query("SELECT COALESCE(SUM(p.commissionAmount), 0.0) FROM Payment p " +
            "LEFT JOIN p.booking b " +
            "WHERE p.status = :status AND b.date BETWEEN :start AND :end")
    Double sumCommissionByStatusAndBookingDateBetween(@Param("status") PaymentStatus status, @Param("start") java.time.LocalDate start, @Param("end") java.time.LocalDate end);

    @Query("SELECT COALESCE(SUM(p.guideAmount), 0.0) FROM Payment p " +
            "LEFT JOIN p.booking b " +
            "WHERE p.status = :status AND b.date BETWEEN :start AND :end")
    Double sumGuideAmountByStatusAndBookingDateBetween(@Param("status") PaymentStatus status, @Param("start") java.time.LocalDate start, @Param("end") java.time.LocalDate end);

    @Query("SELECT COUNT(p) FROM Payment p " +
            "LEFT JOIN p.booking b " +
            "WHERE p.status = :status AND b.date BETWEEN :start AND :end")
    long countByStatusAndBookingDateBetween(@Param("status") PaymentStatus status, @Param("start") java.time.LocalDate start, @Param("end") java.time.LocalDate end);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.status = :status AND p.createdAt >= :date")
    Double sumAmountByStatusAndCreatedAtAfter(@Param("status") PaymentStatus status, @Param("date") java.time.LocalDateTime date);

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.status = :status AND p.createdAt BETWEEN :start AND :end")
    Double sumAmountByStatusAndCreatedAtBetween(@Param("status") PaymentStatus status, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
}
