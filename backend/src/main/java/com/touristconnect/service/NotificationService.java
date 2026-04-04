package com.touristconnect.service;

import org.springframework.lang.NonNull;

import com.touristconnect.entity.Notification;
import com.touristconnect.entity.NotificationType;
import com.touristconnect.entity.User;
import com.touristconnect.repository.NotificationRepository;
import com.touristconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationSocketService notificationSocketService;

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public com.touristconnect.dto.NotificationDto createNotification(@NonNull User user, @NonNull String message,
            @NonNull NotificationType type,
            Long referenceId, String redirectUrl) {
        Notification notification = new Notification(user, message, type, referenceId, redirectUrl);
        Notification savedNotification = notificationRepository.save(notification);

        com.touristconnect.dto.NotificationDto dto = toNotificationDto(savedNotification);

        // Send real-time notification to specific topic
        try {
            notificationSocketService.sendNotification(user.getId(), dto);
        } catch (Exception e) {
            System.err.println("WebSocket failed (non-blocking): " + e.getMessage());
        }

        return dto;
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public com.touristconnect.dto.NotificationDto createNotification(@NonNull User user, @NonNull String message,
            @NonNull NotificationType type, Long referenceId) {
        return createNotification(user, message, type, referenceId, null);
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public com.touristconnect.dto.NotificationDto createNotification(@NonNull User user, @NonNull String message,
            @NonNull NotificationType type) {
        return createNotification(user, message, type, null, null);
    }

    @Transactional(readOnly = true)
    public List<com.touristconnect.dto.NotificationDto> getMyNotifications(@NonNull String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return notifications.stream().map(this::toNotificationDto).collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(@NonNull String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long id, @NonNull String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: Notification does not belong to you");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(@NonNull String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> unreadNotifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        unreadNotifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @NonNull
    private com.touristconnect.dto.NotificationDto toNotificationDto(Notification notification) {
        return new com.touristconnect.dto.NotificationDto(
                notification.getId(),
                notification.getUser().getId(),
                notification.getMessage(),
                notification.getType(),
                notification.getReferenceId(),
                notification.getRedirectUrl(),
                notification.isRead(),
                notification.getCreatedAt());
    }
}
