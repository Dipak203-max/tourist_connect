package com.touristconnect.service;

import com.touristconnect.dto.ChatMessageDto;
import com.touristconnect.dto.ConversationDto;
import com.touristconnect.entity.*;
import com.touristconnect.repository.ChatGroupRepository;
import com.touristconnect.repository.ChatMessageRepository;
import com.touristconnect.repository.ConversationRepository;
import com.touristconnect.repository.UserProfileRepository;
import com.touristconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

        @Autowired
        private ChatMessageRepository chatMessageRepository;
        @Autowired
        private UserRepository userRepository;
        @Autowired
        private ChatGroupRepository chatGroupRepository;
        @Autowired
        private ConversationRepository conversationRepository;
        @Autowired
        private UserProfileRepository userProfileRepository;
        @Autowired
        private NotificationService notificationService;

        @Transactional
        public ChatMessageDto savePrivateMessage(ChatMessageDto messageDto) {
                if (messageDto.getContent() == null || messageDto.getContent().length() > 2000) {
                        throw new RuntimeException("Message content too long or empty");
                }
                Long senderId = messageDto.getSenderId();
                Long receiverId = messageDto.getReceiverId();
                java.util.Objects.requireNonNull(senderId, "Sender ID must not be null");
                java.util.Objects.requireNonNull(receiverId, "Receiver ID must not be null");

                User sender = userRepository.findById(senderId)
                                .orElseThrow(() -> new RuntimeException("Sender not found"));
                User receiver = userRepository.findById(receiverId)
                                .orElseThrow(() -> new RuntimeException("Receiver not found"));

                // Get or create conversation entity (Identifier is symmetric: min_max)
                String identifier = Math.min(sender.getId(), receiver.getId()) + "_"
                                + Math.max(sender.getId(), receiver.getId());
                Conversation conversation = conversationRepository.findByConversationIdentifier(identifier)
                                .orElseGet(() -> {
                                        Conversation conv = new Conversation(sender, receiver, identifier);
                                        conv.setIsGroup(false);
                                        return conversationRepository.save(conv);
                                });

                ChatMessage message = new ChatMessage(sender, receiver, messageDto.getContent(),
                                messageDto.getMessageType());
                message.setConversation(conversation);
                ChatMessage saved = chatMessageRepository.save(message);

                // Update conversation metadata symmetrically
                conversation.setLastMessage(messageDto.getContent());
                conversation.setLastMessageTime(LocalDateTime.now());
                conversationRepository.save(conversation);

                // Send notification
                String senderName = sender.getFullName();
                String notificationMessage = "New message from " + senderName;

                if (saved.getMessageType() == MessageType.ITINERARY) {
                        notificationMessage = senderName + " shared an itinerary with you";
                }

                notificationService.createNotification(
                                receiver,
                                notificationMessage,
                                NotificationType.MESSAGE,
                                saved.getId(),
                                "/chat");

                return mapToDto(saved);
        }

        @Transactional
        public ChatMessageDto saveGroupMessage(ChatMessageDto messageDto) {
                if (messageDto.getContent() == null || messageDto.getContent().length() > 2000) {
                        throw new RuntimeException("Message content too long or empty");
                }
                Long senderId = messageDto.getSenderId();
                Long groupId = messageDto.getGroupId();
                java.util.Objects.requireNonNull(senderId, "Sender ID must not be null");
                java.util.Objects.requireNonNull(groupId, "Group ID must not be null");

                User sender = userRepository.findById(senderId)
                                .orElseThrow(() -> new RuntimeException("Sender not found"));
                ChatGroup group = chatGroupRepository.findById(groupId)
                                .orElseThrow(() -> new RuntimeException("Group not found"));

                

                if (!group.getMembers().contains(sender)) {
                        throw new RuntimeException("User is not a member of this group");
                }

                ChatMessage message = new ChatMessage(sender, group, messageDto.getContent(),
                                messageDto.getMessageType());
                ChatMessage saved = chatMessageRepository.save(message);

                // Send notifications to group members (except sender)
                String senderName = sender.getUsername() != null ? sender.getUsername() : sender.getEmail();
                String notificationMessage = "New message in " + group.getName() + " from " + senderName;

                if (saved.getMessageType() == MessageType.ITINERARY) {
                        notificationMessage = senderName + " shared an itinerary in " + group.getName();
                }

                for (User member : group.getMembers()) {
                        if (!member.getId().equals(sender.getId())) {
                                notificationService.createNotification(
                                                member,
                                                notificationMessage,
                                                NotificationType.MESSAGE,
                                                saved.getId(),
                                                "/chat");
                        }
                }

                return mapToDto(saved);
        }

        @Transactional(readOnly = true)
        public List<ChatMessageDto> getPrivateHistory(String email, Long otherUserId) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                if (otherUserId == null) {
                        throw new RuntimeException("Other user ID cannot be null");
                }
                User otherUser = userRepository.findById(otherUserId)
                                .orElseThrow(() -> new RuntimeException("Other user not found"));

                return chatMessageRepository.findChatHistory(user, otherUser).stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<ChatMessageDto> getGroupHistory(Long groupId, String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (groupId == null) {
                        throw new RuntimeException("Group ID cannot be null");
                }
                ChatGroup group = chatGroupRepository.findById(groupId)
                                .orElseThrow(() -> new RuntimeException("Group not found"));

                if (!group.getMembers().contains(user)) {
                        throw new RuntimeException("Access Denied: You are not a member of this group");
                }

                return chatMessageRepository.findByGroupOrderByCreatedAtAsc(group).stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        private ChatMessageDto mapToDto(ChatMessage msg) {
                String conversationId;
                if (msg.getGroup() != null) {
                        conversationId = "group_" + msg.getGroup().getId();
                } else if (msg.getConversation() != null) {
                        conversationId = msg.getConversation().getConversationIdentifier();
                } else {
                        Long id1 = msg.getSender().getId();
                        Long id2 = msg.getReceiver() != null ? msg.getReceiver().getId() : 0L;
                        conversationId = Math.min(id1, id2) + "_" + Math.max(id1, id2);
                }

                return new ChatMessageDto(
                                msg.getId(),
                                msg.getSender().getId(),
                                msg.getSender().getFullName(),
                                msg.getReceiver() != null ? msg.getReceiver().getId() : null,
                                msg.getGroup() != null ? msg.getGroup().getId() : null,
                                msg.getContent(),
                                msg.getMessageType() != null ? msg.getMessageType() : MessageType.TEXT,
                                msg.getCreatedAt(),
                                msg.isRead(),
                                conversationId);
        }

        @Transactional(readOnly = true)
        public java.util.Map<Long, Long> getUnreadCounts(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                List<Object[]> results = chatMessageRepository.countUnreadMessagesBySender(user);
                return results.stream()
                                .collect(Collectors.toMap(
                                                row -> (Long) row[0],
                                                row -> (Long) row[1]));
        }

        @Transactional
        public void markAsRead(String email, Long senderId) {
                User receiver = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                if (senderId == null) {
                        throw new RuntimeException("Sender ID cannot be null");
                }
                User sender = userRepository.findById(senderId)
                                .orElseThrow(() -> new RuntimeException("Sender not found"));

                chatMessageRepository.markMessagesAsRead(receiver, sender);
        }

        @Transactional(readOnly = true)
        public List<ConversationDto> getConversations(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Symmetric query: find where user is sender OR receiver
                List<Conversation> conversations = conversationRepository.findByUserId(user.getId());

                return conversations.stream().map(c -> {
                        // Correctly identify the "other user" regardless of who started the
                        // conversation
                        User otherUser = c.getSender().getId().equals(user.getId()) ? c.getReceiver() : c.getSender();
                        UserProfile otherUserProfile = userProfileRepository.findByUserId(otherUser.getId())
                                        .orElse(null);

                        // Symmetric unread count
                        int unread = chatMessageRepository.countUnreadMessages(user, otherUser);

                        return new ConversationDto(
                                        c.getConversationIdentifier(),
                                        otherUser.getId(),
                                        otherUser.getFullName(),
                                        otherUser.getEmail(),
                                        otherUserProfile != null ? otherUserProfile.getProfilePictureUrl() : null,
                                        c.getLastMessage(),
                                        c.getLastMessageTime(),
                                        unread);
                }).sorted((a, b) -> b.getLastMessageTime().compareTo(a.getLastMessageTime()))
                                .collect(Collectors.toList());
        }

        public String getOrCreateConversation(String email, Long friendId) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                User friend = userRepository.findById(friendId)
                                .orElseThrow(() -> new RuntimeException("Friend not found"));

                String identifier = Math.min(user.getId(), friendId) + "_" + Math.max(user.getId(), friendId);

                // Symmetric get or create
                conversationRepository.findByConversationIdentifier(identifier)
                                .orElseGet(() -> {
                                        Conversation conv = new Conversation(user, friend, identifier);
                                        conv.setIsGroup(false);
                                        return conversationRepository.save(conv);
                                });

                return identifier;
        }

        public ChatGroup getGroupById(Long groupId) {
                return chatGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        }
}
