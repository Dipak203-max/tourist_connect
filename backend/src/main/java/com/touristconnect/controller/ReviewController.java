package com.touristconnect.controller;

import com.touristconnect.dto.RatingSummaryResponse;
import com.touristconnect.dto.ReviewRequest;
import com.touristconnect.dto.ReviewResponse;
import com.touristconnect.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping("/reviews")
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ReviewRequest reviewRequest) {

        ReviewResponse created = reviewService.createReview(
                userDetails.getUsername(),
                reviewRequest);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/public/guides/{id}/reviews")
    public ResponseEntity<List<ReviewResponse>> getGuideReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getGuideReviews(id));
    }

    @GetMapping("/public/guides/{id}/rating-summary")
    public ResponseEntity<RatingSummaryResponse> getGuideRatingSummary(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getGuideRatingSummary(id));
    }

    @GetMapping("/reviews/check/{bookingId}")
    public ResponseEntity<Boolean> checkIfReviewed(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(reviewService.hasUserReviewedBooking(userDetails.getUsername(), bookingId));
    }
}
