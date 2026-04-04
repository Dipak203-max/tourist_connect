package com.touristconnect.repository;

import com.touristconnect.entity.Conversation;
import com.touristconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.sender.id = :userId OR c.receiver.id = :userId")
    List<Conversation> findByUserId(@Param("userId") Long userId);

    Optional<Conversation> findByConversationIdentifier(String conversationIdentifier);

    @Query("SELECT c FROM Conversation c WHERE (c.sender = :user1 AND c.receiver = :user2) OR (c.sender = :user2 AND c.receiver = :user1)")
    Optional<Conversation> findBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
}
