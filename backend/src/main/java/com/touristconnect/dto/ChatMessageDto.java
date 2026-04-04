package com.touristconnect.dto;

import com.touristconnect.entity.MessageType;
import java.time.LocalDateTime;

public class ChatMessageDto {
    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private Long groupId;
    private String content;
    private MessageType messageType;
    private LocalDateTime createdAt;
    private boolean isRead;
    private String conversationId;

    public ChatMessageDto() {
    }

    public ChatMessageDto(Long id, Long senderId, String senderName, Long receiverId, Long groupId, String content,
            MessageType messageType, LocalDateTime createdAt, boolean isRead) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.receiverId = receiverId;
        this.groupId = groupId;
        this.content = content;
        this.messageType = messageType;
        this.createdAt = createdAt;
        this.isRead = isRead;
    }

    public ChatMessageDto(Long id, Long senderId, String senderName, Long receiverId, Long groupId, String content,
            MessageType messageType, LocalDateTime createdAt, boolean isRead, String conversationId) {
        this(id, senderId, senderName, receiverId, groupId, content, messageType, createdAt, isRead);
        this.conversationId = conversationId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public MessageType getMessageType() {
        return messageType;
    }

    public void setMessageType(MessageType messageType) {
        this.messageType = messageType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }
}
