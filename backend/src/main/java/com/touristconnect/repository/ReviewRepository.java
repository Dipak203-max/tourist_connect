package com.touristconnect.repository;

import com.touristconnect.entity.Booking;
import com.touristconnect.entity.Review;
import com.touristconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByGuideOrderByCreatedAtDesc(User guide);

    Optional<Review> findByBooking(Booking booking);

    boolean existsByBooking(Booking booking);

    boolean existsByBookingId(Long bookingId);

    @Query("SELECT COUNT(r) > 0 FROM Review r WHERE r.booking.id = :bookingId AND r.user.id = :userId")
    boolean existsByBookingIdAndUserId(@Param("bookingId") Long bookingId, @Param("userId") Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.guide.id = :guideId")
    Double getAverageRating(@Param("guideId") Long guideId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.guide.id = :guideId")
    Long countByGuideId(@Param("guideId") Long guideId);
}
