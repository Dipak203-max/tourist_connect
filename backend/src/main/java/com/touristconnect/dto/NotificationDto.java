package com.touristconnect.dto;

import com.touristconnect.entity.NotificationType;
import java.time.LocalDateTime;

public class NotificationDto {
    private Long id;
    private Long userId;
    private String message;
    private NotificationType type;
    private Long referenceId;
    private String redirectUrl;
    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime createdAt;
    private Long groupId;

    public NotificationDto() {
    }

    public NotificationDto(Long id, Long userId, String message, NotificationType type, Long referenceId,
            String redirectUrl, boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
        this.redirectUrl = redirectUrl;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    // Convenience constructor for real-time messages
    public NotificationDto(String message, NotificationType type, Long referenceId, LocalDateTime createdAt) {
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
        this.createdAt = createdAt;
    }

    public NotificationDto(String message, NotificationType type, Long referenceId, Long groupId, LocalDateTime createdAt) {
        this.message = message;
        this.type = type;
        this.referenceId = referenceId;
        this.groupId = groupId;
        this.createdAt = createdAt;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }

    public void setRedirectUrl(String redirectUrl) {
        this.redirectUrl = redirectUrl;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }
}
