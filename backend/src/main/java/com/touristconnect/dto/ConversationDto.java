package com.touristconnect.dto;

import java.time.LocalDateTime;

public class ConversationDto {
    private String conversationId;
    private Long otherUserId;
    private String otherUserFullName;
    private String otherUserEmail;
    private String otherUserProfilePicture;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private int unreadCount;

    public ConversationDto() {
    }

    public ConversationDto(String conversationId, Long otherUserId, String otherUserFullName,
            String otherUserEmail, String otherUserProfilePicture,
            String lastMessage, LocalDateTime lastMessageTime, int unreadCount) {
        this.conversationId = conversationId;
        this.otherUserId = otherUserId;
        this.otherUserFullName = otherUserFullName;
        this.otherUserEmail = otherUserEmail;
        this.otherUserProfilePicture = otherUserProfilePicture;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.unreadCount = unreadCount;
    }

    // Getters and Setters
    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public Long getOtherUserId() {
        return otherUserId;
    }

    public void setOtherUserId(Long otherUserId) {
        this.otherUserId = otherUserId;
    }

    public String getOtherUserFullName() {
        return otherUserFullName;
    }

    public void setOtherUserFullName(String otherUserFullName) {
        this.otherUserFullName = otherUserFullName;
    }

    public String getOtherUserEmail() {
        return otherUserEmail;
    }

    public void setOtherUserEmail(String otherUserEmail) {
        this.otherUserEmail = otherUserEmail;
    }

    public String getOtherUserProfilePicture() {
        return otherUserProfilePicture;
    }

    public void setOtherUserProfilePicture(String otherUserProfilePicture) {
        this.otherUserProfilePicture = otherUserProfilePicture;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(LocalDateTime lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }

    public int getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(int unreadCount) {
        this.unreadCount = unreadCount;
    }
}
