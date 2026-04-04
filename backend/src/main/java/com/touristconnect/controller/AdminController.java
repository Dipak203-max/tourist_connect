package com.touristconnect.controller;

import com.touristconnect.dto.AdminGuideDto;
import com.touristconnect.dto.AdminUserDto;
import com.touristconnect.entity.GuideProfile;
import com.touristconnect.entity.NotificationType;
import com.touristconnect.entity.Role;
import com.touristconnect.entity.User;
import com.touristconnect.entity.VerificationStatus;
import com.touristconnect.repository.ChatMessageRepository;
import com.touristconnect.repository.FriendRequestRepository;
import com.touristconnect.repository.GuideProfileRepository;
import com.touristconnect.repository.NotificationRepository;
import com.touristconnect.repository.UserRepository;
import com.touristconnect.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GuideProfileRepository guideProfileRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private com.touristconnect.service.AdminDashboardService adminDashboardService;

    // --- GUIDE MANAGEMENT ---

    @GetMapping("/guides")
    public ResponseEntity<List<AdminGuideDto>> getAllGuides(
            @RequestParam(required = false) String status) {

        List<User> guideUsers = userRepository.findByRole(Role.GUIDE);

        List<AdminGuideDto> guides = guideUsers.stream()
                .filter(u -> {
                    VerificationStatus s = u.getVerificationStatus();
                    if (s == null)
                        s = VerificationStatus.PENDING;
                    return status == null || s.name().equalsIgnoreCase(status);
                })
                .map(this::convertToAdminGuideDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(guides);
    }

    @PostMapping("/guides/{id}/verify")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<String> verifyGuide(@PathVariable Long id) {
        Objects.requireNonNull(id, "Guide ID must not be null");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getRole().name().equals("GUIDE")) {
            return ResponseEntity.badRequest().body("User is not a guide.");
        }

        user.setVerificationStatus(VerificationStatus.VERIFIED);
        user.setVerifiedGuide(true);
        userRepository.save(user);

        // Auto-create GuideProfile if not exists to ensure visibility in search
        if (guideProfileRepository.findByUser(user).isEmpty()) {
            GuideProfile newProfile = new GuideProfile();
            newProfile.setUser(user);
            newProfile.setAvailable(true);
            newProfile.setLatitude(null);
            newProfile.setLongitude(null);
            newProfile.setSpecialization("General Guide");
            newProfile.setExperienceYears(0);
            newProfile.setLanguages(java.util.Collections.singletonList("English"));
            guideProfileRepository.save(newProfile);
            log.info("Auto-created GuideProfile for user: {} - Profile initialized for search visibility",
                    user.getId());
        }

        // Notify Guide
        try {
            notificationService.createNotification(
                    user,
                    "Congratulations! Your guide profile has been verified by admin.",
                    NotificationType.GUIDE_VERIFIED,
                    null,
                    "/profile");
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        adminDashboardService.logActivity(
                com.touristconnect.entity.AdminActivityType.GUIDE_VERIFIED,
                "Guide verified: " + user.getFullName(),
                user, // The guide user
                user.getId().toString());

        return ResponseEntity.ok("Guide verified successfully.");
    }

    @PostMapping("/guides/{id}/reject")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<String> rejectGuide(@PathVariable Long id) {
        Objects.requireNonNull(id, "Guide ID must not be null");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getRole().name().equals("GUIDE")) {
            return ResponseEntity.badRequest().body("User is not a guide.");
        }

        user.setVerificationStatus(VerificationStatus.REJECTED);
        user.setVerifiedGuide(false);
        userRepository.save(user);

        // Notify Guide
        try {
            notificationService.createNotification(
                    user,
                    "Your guide verification request was rejected. Please update your profile details.",
                    NotificationType.GUIDE_REJECTED,
                    null,
                    "/profile");
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        adminDashboardService.logActivity(
                com.touristconnect.entity.AdminActivityType.GUIDE_REJECTED,
                "Guide rejected: " + user.getFullName(),
                user, // The guide user
                user.getId().toString());

        return ResponseEntity.ok("Guide verification rejected.");
    }

    // --- USER MANAGEMENT ---

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<AdminUserDto> userDtos = users.stream()
                .map(this::convertToAdminUserDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<String> blockUser(@PathVariable Long id) {
        Objects.requireNonNull(id, "User ID must not be null");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.badRequest().body("Cannot block an Admin.");
        }

        user.setBlocked(true);
        userRepository.save(user);

        return ResponseEntity.ok("User blocked successfully.");
    }

    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<String> unblockUser(@PathVariable Long id) {
        Objects.requireNonNull(id, "User ID must not be null");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBlocked(false);
        userRepository.save(user);

        return ResponseEntity.ok("User unblocked successfully.");
    }

    @DeleteMapping("/users/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        Objects.requireNonNull(id, "User ID must not be null");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.badRequest().body("Cannot delete an Admin.");
        }

        // 1. Delete Guide Profile (if exists)
        guideProfileRepository.findByUser(user).ifPresent(guideProfileRepository::delete);

        // 2. Delete Friend Requests (Sent & Received)
        List<com.touristconnect.entity.FriendRequest> sentRequests = friendRequestRepository.findBySender(user);
        List<com.touristconnect.entity.FriendRequest> receivedRequests = friendRequestRepository.findByReceiver(user);
        friendRequestRepository.deleteAll(sentRequests);
        friendRequestRepository.deleteAll(receivedRequests);

        // 3. Delete Notifications
        List<com.touristconnect.entity.Notification> notifications = notificationRepository
                .findByUserOrderByCreatedAtDesc(user);
        notificationRepository.deleteAll(notifications);

        // 4. Delete Chat Messages (Sent & Received)
        List<com.touristconnect.entity.ChatMessage> sentMessages = chatMessageRepository.findBySender(user);
        List<com.touristconnect.entity.ChatMessage> receivedMessages = chatMessageRepository.findByReceiver(user);
        chatMessageRepository.deleteAll(sentMessages);
        chatMessageRepository.deleteAll(receivedMessages);

        // 5. Delete User
        userRepository.delete(user);
        return ResponseEntity.ok("User deleted successfully.");
    }

    // --- CONTENT MODERATION ---

    @GetMapping("/reports")
    public ResponseEntity<List<String>> getReports() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    // --- HELPERS ---

    private AdminGuideDto convertToAdminGuideDto(User user) {
        GuideProfile profile = guideProfileRepository.findByUser(user).orElse(null);
        String displayName = user.getUsername();
        if (displayName == null || displayName.isEmpty()) {
            displayName = user.getEmail();
        }

        VerificationStatus status = user.getVerificationStatus();
        if (status == null) {
            status = VerificationStatus.PENDING;
        }

        return new AdminGuideDto(
                user.getId(),
                displayName,
                user.getEmail(),
                profile != null ? profile.getSpecialization() : "N/A",
                profile != null ? profile.getExperienceYears() : 0,
                profile != null ? profile.getLanguages() : Collections.emptyList(),
                status,
                user.getCreatedAt());
    }

    private AdminUserDto convertToAdminUserDto(User user) {
        return new AdminUserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.isBlocked(),
                user.getVerificationStatus(),
                user.getCreatedAt(),
                user.isVerifiedGuide());
    }
}
