package com.touristconnect.service;

import com.touristconnect.dto.*;
import com.touristconnect.entity.GuideProfile;
import com.touristconnect.entity.TourPackage;
import com.touristconnect.entity.Review;
import com.touristconnect.entity.User;
import com.touristconnect.repository.*;
import com.touristconnect.entity.UserProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GuideProfileService {

    @Autowired
    private GuideProfileRepository guideProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private TourPackageRepository tourPackageRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Transactional
    public GuideProfileDto createOrUpdateProfile(String email, GuideProfileDto profileDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"GUIDE".equals(user.getRole().name())) {
            throw new RuntimeException("Only guides can have a guide profile");
        }

        GuideProfile profile = guideProfileRepository.findByUser(user)
                .orElse(new GuideProfile());

        if (profile.getUser() == null) {
            profile.setUser(user);
        }

        if (profileDto.getPrice() == null || profileDto.getPrice() <= 0) {
            throw new RuntimeException("Guide must set a valid price per day");
        }

        profile.setSpecialization(profileDto.getSpecialization());
        profile.setExperienceYears(profileDto.getExperienceYears());
        profile.setLanguages(profileDto.getLanguages());
        profile.setPrice(profileDto.getPrice());
        profile.setLatitude(profileDto.getLatitude());
        profile.setLongitude(profileDto.getLongitude());
        profile.setCity(profileDto.getCity());
        profile.setCountry(profileDto.getCountry());
        profile.setAvailable(profileDto.isAvailable());
        
        // New Professional Fields
        profile.setBio(profileDto.getBio());
        profile.setCertifications(profileDto.getCertifications());
        profile.setResponseTime(profileDto.getResponseTime());
        profile.setGalleryImages(profileDto.getGalleryImages());
        profile.setCoverImageUrl(profileDto.getCoverImageUrl());

        // Sync Phone Number with User entity
        if (profileDto.getPhoneNumber() != null && !profileDto.getPhoneNumber().isEmpty()) {
            user.setPhoneNumber(profileDto.getPhoneNumber());
            userRepository.save(user);
        }

        GuideProfile savedProfile = guideProfileRepository.save(profile);

        return mapToDto(savedProfile);
    }

    @Transactional(readOnly = true)
    public GuideProfileDto getMyProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        GuideProfile profile = guideProfileRepository.findByUser(user).orElse(null);

        if (profile == null) {
            String verificationStatus = user.getVerificationStatus() != null ? user.getVerificationStatus().name() : "PENDING";
            return new GuideProfileDto(null, user.getId(), user.getFullName(), "", 0, java.util.Collections.emptyList(),
                    0.0, 0, null, null, "", "", 0.0, true, "", null, 
                    java.util.Collections.emptyList(), java.util.Collections.emptyList(), "", "Within 1 hour", 
                    user.getPhoneNumber(), user.getEmail(), "VERIFIED".equals(verificationStatus));
        }

        return mapToDto(profile);
    }

    @Transactional(readOnly = true)
    public GuideProfileDto getProfileByUserId(Long userId) {
        GuideProfile profile = guideProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Guide profile not found."));
        return mapToDto(profile);
    }

    @Transactional(readOnly = true)
    public DetailedGuideProfileDto getDetailedProfile(Long userId) {
        GuideProfile profile = guideProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Guide profile not found."));

        GuideProfileDto guideDto = mapToDto(profile);

        // Fetch Tours
        List<TourPackage> tours = tourPackageRepository.findByGuideProfileId(profile.getId());
        List<TourPackageDto> tourDtos = tours.stream()
                .map(this::mapToTourDto)
                .collect(Collectors.toList());

        // Fetch Reviews
        List<Review> reviews = reviewRepository.findByGuide(profile.getUser());
        List<ReviewDto> reviewDtos = reviews.stream()
                .map(this::mapToReviewDto)
                .collect(Collectors.toList());

        // Calculate Stats
        Map<String, Object> stats = new HashMap<>();
        stats.put("rating", profile.getRating());
        stats.put("totalReviews", (long) profile.getReviewCount());
        stats.put("totalTours", (long) tourDtos.size());
        stats.put("completedBookings", (long) profile.getReviewCount()); // Using review count as a proxy for completed bookings if not explicitly tracked

        return DetailedGuideProfileDto.builder()
                .guide(guideDto)
                .stats(stats)
                .tours(tourDtos)
                .reviews(reviewDtos)
                .commissionPercent(10.0) // Standard 10% commission
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.List<GuideProfileDto> searchGuides(Double lat, Double lng, Double radius, String city) {
        log.info("Executing guide search: lat={}, lng={}, radius={}, city={}", lat, lng, radius, city);

        try {
            java.util.List<GuideProfile> allVerifiedGuides;

            // 1. Fetch filtered list based on City (if provided) or ALL verified guides
            if (city != null && !city.isEmpty()) {
                allVerifiedGuides = guideProfileRepository.findByCity(city);
            } else {
                allVerifiedGuides = guideProfileRepository.findAllVerifiedGuides();
            }

            // 2. Check for missing location parameters -> Return ALL found
            if (lat == null || lng == null || radius == null) {
                log.info("Location parameters missing. Returning {} verified guides.", allVerifiedGuides.size());
                return allVerifiedGuides.stream()
                        .map(this::mapToDto)
                        .collect(java.util.stream.Collectors.toList());
            }

            // 3. Perform Distance Filtering (only if location provided)
            log.info("Filtering guides by radius: {}km from {}, {}", radius, lat, lng);
            return allVerifiedGuides.stream()
                    .filter(guide -> {
                        // Safety check for guide coordinates
                        if (guide.getLatitude() == null || guide.getLongitude() == null) {
                            return false;
                        }
                        double distance = calculateDistance(lat, lng, guide.getLatitude(), guide.getLongitude());
                        boolean withinRange = distance <= radius;
                        if (withinRange) {
                            log.debug("Guide {} ({}): {}km - WITHIN range", guide.getId(), guide.getCity(), distance);
                        }
                        return withinRange;
                    })
                    .map(this::mapToDto)
                    .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            log.error("Error during guide search", e);
            throw new RuntimeException("An error occurred while searching for guides: " + e.getMessage());
        }
    }

    @Transactional
    public GuideProfileDto updateLocation(String email, Double lat, Double lng, String city) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        GuideProfile profile = guideProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Guide profile not found"));

        profile.setLatitude(lat);
        profile.setLongitude(lng);
        profile.setCity(city);
        profile.setAvailable(true);

        GuideProfile savedProfile = guideProfileRepository.save(profile);
        return mapToDto(savedProfile);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private GuideProfileDto mapToDto(GuideProfile profile) {
        UserProfile userProfile = userProfileRepository.findByUser(profile.getUser()).orElse(null);
        String bio = userProfile != null ? userProfile.getBio() : "";
        String profilePictureUrl = userProfile != null ? userProfile.getProfilePictureUrl() : null;

        return new GuideProfileDto(
                profile.getId(),
                profile.getUser().getId(),
                profile.getUser().getFullName(),
                profile.getSpecialization(),
                profile.getExperienceYears(),
                profile.getLanguages(),
                profile.getRating(),
                profile.getReviewCount(),
                profile.getLatitude(),
                profile.getLongitude(),
                profile.getCity(),
                profile.getCountry(),
                profile.getPrice(),
                profile.isAvailable(),
                profile.getBio() != null ? profile.getBio() : bio,
                profilePictureUrl,
                profile.getCertifications(),
                profile.getGalleryImages(),
                profile.getCoverImageUrl(),
                profile.getResponseTime(),
                profile.getUser().getPhoneNumber(),
                profile.getUser().getEmail(),
                profile.isVerified() || (profile.getUser().getVerificationStatus() != null && "VERIFIED".equals(profile.getUser().getVerificationStatus().name())));
    }

    private TourPackageDto mapToTourDto(TourPackage tour) {
        return TourPackageDto.builder()
                .id(tour.getId())
                .title(tour.getTitle())
                .description(tour.getDescription())
                .pricePerPerson(tour.getPricePerPerson())
                .duration(tour.getDuration())
                .rating(tour.getRating())
                .imageUrl(tour.getImageUrl())
                .category(tour.getCategory())
                .build();
    }

    private ReviewDto mapToReviewDto(Review review) {
        UserProfile userProfile = userProfileRepository.findByUser(review.getUser()).orElse(null);
        String avatar = userProfile != null ? userProfile.getProfilePictureUrl() : null;

        return new ReviewDto(
                review.getId(),
                review.getUser().getId(),
                review.getUser().getFullName(),
                avatar,
                review.getGuide().getId(),
                review.getBooking().getId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
