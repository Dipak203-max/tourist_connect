package com.touristconnect.service;

import com.touristconnect.dto.NotificationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    
    public void sendNotification(Long userId, NotificationDto notificationDto) {
        if (userId != null && notificationDto != null) {
            try {
                messagingTemplate.convertAndSend("/topic/notifications/" + userId, (Object) notificationDto);
            } catch (Exception e) {
                // Log and ignore to prevent transaction rollback
                System.err.println("Failed to send WebSocket notification to user " + userId + ": " + e.getMessage());
            }
        }
    }
}
