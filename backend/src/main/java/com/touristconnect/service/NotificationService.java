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

    @Transactional
    public com.touristconnect.dto.NotificationDto createNotification(@NonNull User user, @NonNull String message,
            @NonNull NotificationType type,
            Long referenceId, String redirectUrl, Long groupId) {
        Notification notification = new Notification(user, message, type, referenceId, redirectUrl);
        notification.setGroupId(groupId);
        Notification savedNotification = notificationRepository.save(notification);

        com.touristconnect.dto.NotificationDto dto = toNotificationDto(savedNotification);

        // Send real-time notification to specific topic after transaction commits
        try {
            if (org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()) {
                org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                        new org.springframework.transaction.support.TransactionSynchronization() {
                            @Override
                            public void afterCommit() {
                                notificationSocketService.sendNotification(user.getId(), dto);
                            }
                        });
            } else {
                notificationSocketService.sendNotification(user.getId(), dto);
            }
        } catch (Exception e) {
            System.err.println("WebSocket scheduling failed: " + e.getMessage());
        }

        return dto;
    }

    @Transactional
    public com.touristconnect.dto.NotificationDto createNotification(@NonNull User user, @NonNull String message,
            @NonNull NotificationType type,
            Long referenceId, String redirectUrl) {
        return createNotification(user, message, type, referenceId, redirectUrl, null);
    }

    @Transactional
    public com.touristconnect.dto.NotificationDto createNotification(@NonNull User user, @NonNull String message,
            @NonNull NotificationType type, Long referenceId) {
        return createNotification(user, message, type, referenceId, null);
    }

    @Transactional
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
        return notificationRepository.countByUserAndIsReadFalseAndTypeNot(user, NotificationType.MESSAGE);
    }

    @Transactional(readOnly = true)
    public long getGroupUnreadCount(@NonNull String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Filter out notifications for groups the user is no longer a member of
        return notificationRepository.countUnreadForActiveGroups(user, NotificationType.MESSAGE);
    }

    @Transactional(readOnly = true)
    public java.util.Map<Long, Long> getGroupUnreadCountsMap(@NonNull String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Filter out notifications for groups the user is no longer a member of
        List<Notification> unreadGroupNotifs = notificationRepository.findUnreadForActiveGroups(user, NotificationType.MESSAGE);
        
        return unreadGroupNotifs.stream()
                .filter(n -> n.getGroupId() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        Notification::getGroupId,
                        java.util.stream.Collectors.counting()
                ));
    }

    @Transactional
    public void markGroupNotificationsAsRead(Long groupId, @NonNull String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationRepository.markGroupNotificationsAsRead(user, groupId);
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
        com.touristconnect.dto.NotificationDto dto = new com.touristconnect.dto.NotificationDto(
                notification.getId(),
                notification.getUser().getId(),
                notification.getMessage(),
                notification.getType(),
                notification.getReferenceId(),
                notification.getRedirectUrl(),
                notification.isRead(),
                notification.getCreatedAt());
        dto.setGroupId(notification.getGroupId());
        return dto;
    }
}
