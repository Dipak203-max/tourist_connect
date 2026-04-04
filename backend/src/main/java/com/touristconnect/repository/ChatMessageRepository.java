package com.touristconnect.repository;

import com.touristconnect.entity.ChatMessage;
import com.touristconnect.entity.User;
import com.touristconnect.entity.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // For private chats: Find messages between two users ordered by time
    @Query("SELECT cm FROM ChatMessage cm WHERE (cm.sender = :user1 AND cm.receiver = :user2) OR (cm.sender = :user2 AND cm.receiver = :user1) ORDER BY cm.createdAt ASC")
    List<ChatMessage> findChatHistory(@Param("user1") User user1, @Param("user2") User user2);

    // For group chats
    List<ChatMessage> findByGroupOrderByCreatedAtAsc(ChatGroup group);

    // Count unread messages per sender for the receiver
    @Query("SELECT cm.sender.id, COUNT(cm) FROM ChatMessage cm WHERE cm.receiver = :receiver AND cm.isRead = false GROUP BY cm.sender.id")
    List<Object[]> countUnreadMessagesBySender(@Param("receiver") User receiver);

    // Mark all messages from a specific sender to receiver as read
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE ChatMessage cm SET cm.isRead = true WHERE cm.receiver = :receiver AND cm.sender = :sender AND cm.isRead = false")
    void markMessagesAsRead(@Param("receiver") User receiver, @Param("sender") User sender);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.receiver = :receiver AND cm.sender = :sender AND cm.isRead = false")
    int countUnreadMessages(@Param("receiver") User receiver, @Param("sender") User sender);

    List<ChatMessage> findBySender(User sender);

    List<ChatMessage> findByReceiver(User receiver);
}
