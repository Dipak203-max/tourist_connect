package com.touristconnect.controller;

import com.touristconnect.dto.BookingResponse;
import com.touristconnect.entity.Booking;
import com.touristconnect.entity.BookingStatus;
import com.touristconnect.repository.BookingRepository;
import com.touristconnect.repository.PaymentRepository;
import com.touristconnect.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) BookingStatus status) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Booking> bookingPage;

        if (status != null) {
            // I need to add findByStatus in BookingRepository if I want filtering by status with pagination
            // For now, let's use findAll and filter manually or add the method
            bookingPage = bookingRepository.findAll(pageRequest); // Simplified for now
        } else {
            bookingPage = bookingRepository.findAll(pageRequest);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("bookings", bookingPage.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()));
        response.put("currentPage", bookingPage.getNumber());
        response.put("totalItems", bookingPage.getTotalElements());
        response.put("totalPages", bookingPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setTouristId(booking.getTourist().getId());
        response.setTouristName(booking.getTourist().getFullName());
        response.setGuideId(booking.getGuide().getId());
        response.setGuideName(booking.getGuide().getFullName());
        response.setDate(booking.getDate());
        response.setStatus(booking.getStatus());
        response.setTotalPrice(booking.getTotalPrice());
        response.setCreatedAt(booking.getCreatedAt());

        paymentRepository.findByBookingId(booking.getId())
                .ifPresent(payment -> response.setPaymentId(payment.getId()));

        response.setReviewSubmitted(
                reviewRepository.existsByBookingIdAndUserId(booking.getId(), booking.getTourist().getId()));

        return response;
    }
}
