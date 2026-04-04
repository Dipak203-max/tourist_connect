package com.touristconnect.repository;

import com.touristconnect.entity.Booking;
import com.touristconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
        List<Booking> findByTouristOrderByCreatedAtDesc(User tourist);

        List<Booking> findByGuideOrderByCreatedAtDesc(User guide);

        boolean existsByGuideAndDateAndStatus(User guide, java.time.LocalDate date,
                        com.touristconnect.entity.BookingStatus status);

        boolean existsByTouristAndGuideAndStatus(User tourist, User guide,
                        com.touristconnect.entity.BookingStatus status);

        java.util.Optional<Booking> findFirstByTouristAndGuideAndStatusOrderByDateDesc(User tourist, User guide,
                        com.touristconnect.entity.BookingStatus status);

        List<Booking> findByTouristAndGuideAndStatus(User tourist, User guide,
                        com.touristconnect.entity.BookingStatus status);

        long count();

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt >= :date")
        long countByCreatedAtAfter(@org.springframework.data.repository.query.Param("date") java.time.LocalDateTime date);

        long countByStatus(com.touristconnect.entity.BookingStatus status);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt BETWEEN :start AND :end")
        long countByCreatedAtBetween(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start, @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);
}
