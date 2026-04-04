package com.touristconnect.service;

import com.touristconnect.dto.RatingSummaryResponse;
import com.touristconnect.dto.ReviewRequest;
import com.touristconnect.dto.ReviewResponse;
import com.touristconnect.entity.Booking;
import com.touristconnect.entity.BookingStatus;
import com.touristconnect.entity.Review;
import com.touristconnect.entity.User;
import com.touristconnect.exception.BadRequestException;
import com.touristconnect.exception.ResourceConflictException;
import com.touristconnect.repository.BookingRepository;
import com.touristconnect.repository.ReviewRepository;
import com.touristconnect.repository.UserRepository;
import com.touristconnect.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

        @Autowired
        private ReviewRepository reviewRepository;

        @Autowired
        private BookingRepository bookingRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private UserProfileRepository userProfileRepository;

        @Transactional
        public ReviewResponse createReview(String userEmail, ReviewRequest dto) {
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Long bookingId = dto.getBookingId();
                if (bookingId == null) {
                        throw new BadRequestException("Booking ID cannot be null");
                }
                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new BadRequestException("Booking not found"));

                // Ensure booking belongs to user
                if (!booking.getTourist().getId().equals(user.getId())) {
                        throw new BadRequestException("You can only review your own bookings.");
                }

                // Ensure booking status = COMPLETED or PAID
                if (booking.getStatus() != BookingStatus.COMPLETED && booking.getStatus() != BookingStatus.PAID) {
                        throw new BadRequestException("You can only review completed or paid bookings.");
                }

                // Validate rating
                if (dto.getRating() < 1 || dto.getRating() > 5) {
                        throw new BadRequestException("Rating must be between 1 and 5.");
                }

                // Prevent duplicate reviews
                if (reviewRepository.existsByBooking(booking)) {
                        throw new ResourceConflictException("A review already exists for this booking.");
                }

                Review review = new Review();
                review.setUser(user);
                review.setGuide(booking.getGuide());
                review.setBooking(booking);
                review.setRating(dto.getRating());
                review.setComment(dto.getComment());
                review.setCreatedAt(LocalDateTime.now());

                Review saved = reviewRepository.save(review);
                return mapToResponse(saved);
        }

        @Transactional(readOnly = true)
        public List<ReviewResponse> getGuideReviews(Long guideId) {
                if (guideId == null) {
                        throw new BadRequestException("Guide ID cannot be null");
                }
                User guide = userRepository.findById(guideId)
                                .orElseThrow(() -> new RuntimeException("Guide not found"));

                return reviewRepository.findByGuide(guide).stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public RatingSummaryResponse getGuideRatingSummary(Long guideId) {
                if (guideId == null) {
                        throw new BadRequestException("Guide ID cannot be null");
                }
                if (!userRepository.existsById(guideId)) {
                        throw new RuntimeException("Guide not found");
                }
                Double avg = reviewRepository.getAverageRating(guideId);
                Long count = reviewRepository.countByGuideId(guideId);

                double roundedAvg = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
                return new RatingSummaryResponse(roundedAvg, count != null ? count : 0L);
        }

        @Transactional(readOnly = true)
        public boolean hasUserReviewedBooking(String userEmail, Long bookingId) {
                if (bookingId == null || userEmail == null) {
                        return false;
                }
                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new BadRequestException("Booking not found"));
                
                if (!booking.getTourist().getId().equals(user.getId())) {
                        return false;
                }
                return reviewRepository.existsByBooking(booking);
        }

        private ReviewResponse mapToResponse(Review review) {
                String avatar = userProfileRepository.findByUser(review.getUser())
                                .map(com.touristconnect.entity.UserProfile::getProfilePictureUrl)
                                .orElse(null);

                String userName = review.getUser().getUsername() != null ? review.getUser().getUsername()
                                : review.getUser().getEmail();

                return new ReviewResponse(
                                review.getId(),
                                review.getUser().getId(),
                                userName,
                                avatar,
                                review.getGuide().getId(),
                                review.getBooking().getId(),
                                review.getRating(),
                                review.getComment(),
                                review.getCreatedAt());
        }
}
