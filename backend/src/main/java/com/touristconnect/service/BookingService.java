package com.touristconnect.service;

import com.touristconnect.dto.BookingRequest;
import com.touristconnect.dto.BookingResponse;
import com.touristconnect.entity.*;
import com.touristconnect.exception.BadRequestException;
import com.touristconnect.repository.BookingRepository;
import com.touristconnect.repository.GuideProfileRepository;
import com.touristconnect.repository.PaymentRepository;
import com.touristconnect.repository.ReviewRepository;
import com.touristconnect.repository.TourPackageRepository;
import com.touristconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GuideProfileRepository guideProfileRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AdminDashboardService adminDashboardService;

    @Autowired
    private TourPackageRepository tourPackageRepository;

    @Transactional
    public BookingResponse createBooking(User tourist, BookingRequest request) {
        // Enforce role check for tourist
        if (tourist.getRole() != Role.TOURIST) {
            throw new RuntimeException("Only tourists can create bookings");
        }

        User guideUser = userRepository.findById(request.getGuideId())
                .orElseThrow(() -> new RuntimeException("Guide user not found"));

        if (guideUser.getRole() != Role.GUIDE) {
            throw new RuntimeException("Target user is not a guide");
        }

        if (tourist.getId().equals(guideUser.getId())) {
            throw new RuntimeException("You cannot book yourself");
        }

        // Prevent overlapping bookings
        boolean alreadyBooked = bookingRepository.existsByGuideAndDateAndStatus(
                guideUser, request.getDate(), BookingStatus.CONFIRMED);
        if (alreadyBooked) {
            throw new RuntimeException("The guide is already booked for this date");
        }

        // Fetch guide profile for pricing
        GuideProfile guideProfile = guideProfileRepository.findByUser(guideUser)
                .orElseThrow(() -> new RuntimeException("Guide profile not found"));

        // Custom pricing based on TourPackage and travelers
        TourPackage tourPackage = null;
        Integer travelers = request.getTravelers() != null && request.getTravelers() > 0 ? request.getTravelers() : 1;
        Double totalPrice = 0.0;

        if (request.getTourId() != null) {
            tourPackage = tourPackageRepository.findById(request.getTourId())
                    .orElseThrow(() -> new RuntimeException("Tour not found in DB: " + request.getTourId()));
            totalPrice = tourPackage.getPricePerPerson() * travelers;
        } else {
            // Check if guide has set a price
            if (guideProfile.getPrice() == null || guideProfile.getPrice() <= 0) {
                throw new BadRequestException("Guide has not set a base price yet");
            }
            totalPrice = guideProfile.getPrice() * travelers;
        }

        Booking booking = new Booking();
        booking.setTourist(tourist);
        booking.setGuide(guideUser);
        booking.setDate(request.getDate());
        booking.setTourPackage(tourPackage);
        booking.setTravelers(travelers);
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalPrice(totalPrice);
        booking.setCreatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        // Trigger Notification to Guide
        notificationService.createNotification(
                guideUser,
                "New booking request from "
                        + (tourist.getUsername() != null ? tourist.getUsername() : tourist.getEmail()) + " for "
                        + booking.getDate(),
                NotificationType.BOOKING_REQUESTED,
                savedBooking.getId());

        adminDashboardService.logActivity(
                AdminActivityType.BOOKING_CREATED,
                "New booking request created by " + tourist.getFullName() + " for guide " + guideUser.getFullName(),
                tourist,
                savedBooking.getId().toString());

        return mapToResponse(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getTouristBookings(User tourist) {
        return bookingRepository.findByTouristOrderByCreatedAtDesc(tourist).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getGuideBookings(User guide) {
        return bookingRepository.findByGuideOrderByCreatedAtDesc(guide).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getCompletedBookingsWithGuide(User tourist, Long guideId) {
        User guide = userRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Guide not found"));

        return bookingRepository.findByTouristAndGuideAndStatus(tourist, guide, BookingStatus.COMPLETED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatus status, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isGuide = booking.getGuide().getId().equals(user.getId());
        boolean isTourist = booking.getTourist().getId().equals(user.getId());

        if (!isGuide && !isTourist) {
            throw new RuntimeException("Unauthorized to update this booking");
        }

        // Logic for state transitions
        if (status == BookingStatus.CONFIRMED || status == BookingStatus.REJECTED) {
            if (!isGuide) {
                throw new RuntimeException("Only guides can confirm or reject bookings");
            }
            if (status == BookingStatus.CONFIRMED) {
                // Secondary check for overlap when confirming
                boolean alreadyBooked = bookingRepository.existsByGuideAndDateAndStatus(
                        booking.getGuide(), booking.getDate(), BookingStatus.CONFIRMED);
                if (alreadyBooked) {
                    throw new RuntimeException("You are already booked for this date");
                }
            }
        }

        if (status == BookingStatus.CANCELLED) {
            if (booking.getStatus() == BookingStatus.COMPLETED) {
                throw new RuntimeException("Cannot cancel a completed booking");
            }
        }

        if (status == BookingStatus.COMPLETED) {
            if (!isGuide) {
                throw new RuntimeException("Only guides can mark bookings as completed");
            }
            if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.PAID) {
                throw new RuntimeException("Can only complete confirmed or paid bookings");
            }
        }

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(status);
        Booking savedBooking = bookingRepository.save(booking);

        // Trigger Notifications for status updates
        if (status == BookingStatus.CONFIRMED) {
            notificationService.createNotification(
                    booking.getTourist(),
                    "Your booking with "
                            + (booking.getGuide().getUsername() != null ? booking.getGuide().getUsername()
                                    : booking.getGuide().getEmail())
                            + " for " + booking.getDate() + " has been confirmed!",
                    NotificationType.BOOKING_CONFIRMED,
                    savedBooking.getId());
        } else if (status == BookingStatus.REJECTED) {
            notificationService.createNotification(
                    booking.getTourist(),
                    "Your booking request for " + booking.getDate() + " was rejected by the guide.",
                    NotificationType.BOOKING_REJECTED,
                    savedBooking.getId());
        } else if (status == BookingStatus.CANCELLED) {
            User otherParty = isGuide ? booking.getTourist() : booking.getGuide();
            String partyType = isGuide ? "Guide" : "Tourist";
            notificationService.createNotification(
                    otherParty,
                    "Booking for " + booking.getDate() + " has been cancelled by the " + partyType + ".",
                    NotificationType.BOOKING_CANCELLED,
                    savedBooking.getId());
        }

        AdminActivityType activityType = null;
        String description = "";
        if (status == BookingStatus.CANCELLED) {
            activityType = AdminActivityType.BOOKING_CANCELLED;
            description = "Booking #" + bookingId + " cancelled by " + user.getFullName();
        } else if (status == BookingStatus.COMPLETED) {
            activityType = AdminActivityType.BOOKING_COMPLETED;
            description = "Booking #" + bookingId + " marked as completed by Guide " + user.getFullName();
        }

        if (activityType != null) {
            adminDashboardService.logActivity(activityType, description, user, bookingId.toString());
        }

        return mapToResponse(savedBooking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setTouristId(booking.getTourist().getId());
        response.setTouristName(booking.getTourist().getEmail());
        response.setGuideId(booking.getGuide().getId());
        response.setGuideName(booking.getGuide().getEmail());
        response.setDate(booking.getDate());
        response.setStatus(booking.getStatus());
        response.setTotalPrice(booking.getTotalPrice());
        response.setCreatedAt(booking.getCreatedAt());

        // Attach payment ID if exists
        paymentRepository.findByBookingId(booking.getId())
                .ifPresent(payment -> response.setPaymentId(payment.getId()));

        // Check if review submitted
        response.setReviewSubmitted(
                reviewRepository.existsByBookingIdAndUserId(booking.getId(), booking.getTourist().getId()));

        return response;
    }
}
