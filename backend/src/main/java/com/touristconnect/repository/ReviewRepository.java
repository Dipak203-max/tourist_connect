package com.touristconnect.repository;

import com.touristconnect.entity.Booking;
import com.touristconnect.entity.Review;
import com.touristconnect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByGuideOrderByCreatedAtDesc(User guide, Pageable pageable);

    List<Review> findByGuide(User guide);

    Optional<Review> findByBooking(Booking booking);

    boolean existsByBooking(Booking booking);

    boolean existsByBookingId(Long bookingId);

    boolean existsByBookingIdAndUserId(Long bookingId, Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.guide.id = :guideId")
    Double getAverageRating(@Param("guideId") Long guideId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.guide.id = :guideId")
    Long countByGuideId(@Param("guideId") Long guideId);
}
