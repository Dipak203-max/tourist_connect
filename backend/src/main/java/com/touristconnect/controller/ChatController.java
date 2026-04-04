package com.touristconnect.controller;

import com.touristconnect.dto.ChatMessageDto;
import com.touristconnect.entity.ChatGroup;
import com.touristconnect.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.touristconnect.entity.User;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    // WebSocket: One-to-One
    @MessageMapping("/chat.send")
    public void sendPrivateMessage(@Payload ChatMessageDto messageDto) {
        ChatMessageDto saved = chatService.savePrivateMessage(messageDto);
        messagingTemplate.convertAndSend("/queue/messages/" + saved.getReceiverId(), saved);

        messagingTemplate.convertAndSend("/queue/messages/" + saved.getSenderId(), saved);
    }

    // Modern WebSocket: Broadcast to conversation topic
    @MessageMapping("/chat.sendMessage")
    public void sendPrivateMessageToTopic(@Payload ChatMessageDto messageDto) {
        ChatMessageDto saved = chatService.savePrivateMessage(messageDto);
        // Instant broadcast to both sender and receiver who are in the topic
        messagingTemplate.convertAndSend("/topic/messages/" + saved.getConversationId(), saved);

        // Also send to individual queues so they get unread counts in background
        messagingTemplate.convertAndSend("/queue/messages/" + saved.getReceiverId(), saved);
        messagingTemplate.convertAndSend("/queue/messages/" + saved.getSenderId(), saved);
    }

    // WebSocket: Group
    @MessageMapping("/chat/group/{groupId}")
    public void sendGroupMessage(@org.springframework.messaging.handler.annotation.DestinationVariable Long groupId,
            @Payload ChatMessageDto messageDto,
            Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Unauthorized");
        }
        // Ideally verify that authentication.getName() matches messageDto.senderId
        messageDto.setGroupId(groupId);

        ChatMessageDto saved = chatService.saveGroupMessage(messageDto);
        messagingTemplate.convertAndSend("/topic/group-chat/" + saved.getGroupId(), saved);

        // Send real-time notification to each member
        ChatGroup group = chatService.getGroupById(saved.getGroupId());

            for (User member : group.getMembers()) {
                if (!member.getId().equals(saved.getSenderId())) {
                    messagingTemplate.convertAndSendToUser(
                    member.getId().toString(),
                "/queue/notifications",
                    saved
             );
                }
            }
        
        }

    // REST History
    @GetMapping("/private/{otherUserId}")
    public ResponseEntity<List<ChatMessageDto>> getPrivateHistory(Authentication authentication,
            @PathVariable Long otherUserId) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.getPrivateHistory(email, otherUserId));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<ChatMessageDto>> getGroupHistory(Authentication authentication,
            @PathVariable Long groupId) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.getGroupHistory(groupId, email));
    }

    @GetMapping("/unread")
    public ResponseEntity<java.util.Map<Long, Long>> getUnreadCounts(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.getUnreadCounts(email));
    }

    @PutMapping("/read/{senderId}")
    public ResponseEntity<Void> markAsRead(Authentication authentication, @PathVariable Long senderId) {
        String email = authentication.getName();
        chatService.markAsRead(email, senderId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<com.touristconnect.dto.ConversationDto>> getConversations(
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.getConversations(email));
    }

    @PostMapping("/conversation")
    public ResponseEntity<String> getOrCreateConversation(Authentication authentication, @RequestBody java.util.Map<String, Object> payload) {
        String email = authentication.getName();
        Long receiverId = Long.valueOf(payload.get("receiverId").toString());
        return ResponseEntity.ok(chatService.getOrCreateConversation(email, receiverId));
    }
}
