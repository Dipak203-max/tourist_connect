package com.touristconnect.controller;

import com.touristconnect.dto.BookingRequest;
import com.touristconnect.dto.BookingResponse;
import com.touristconnect.entity.BookingStatus;
import com.touristconnect.entity.User;
import com.touristconnect.repository.UserRepository;
import com.touristconnect.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody BookingRequest request) {
        User tourist = getCurrentUser(userDetails);
        return ResponseEntity.ok(bookingService.createBooking(tourist, request));
    }

    @GetMapping("/tourist")
    public ResponseEntity<List<BookingResponse>> getTouristBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        User tourist = getCurrentUser(userDetails);
        return ResponseEntity.ok(bookingService.getTouristBookings(tourist));
    }

    @GetMapping("/guide")
    public ResponseEntity<List<BookingResponse>> getGuideBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        User guide = getCurrentUser(userDetails);
        return ResponseEntity.ok(bookingService.getGuideBookings(guide));
    }

    @GetMapping("/completed/{guideId}")
    public ResponseEntity<List<BookingResponse>> getCompletedBookingsWithGuide(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long guideId) {
        User tourist = getCurrentUser(userDetails);
        return ResponseEntity.ok(bookingService.getCompletedBookingsWithGuide(tourist, guideId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam BookingStatus status) {
        User user = getCurrentUser(userDetails);
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, user));
    }
}
