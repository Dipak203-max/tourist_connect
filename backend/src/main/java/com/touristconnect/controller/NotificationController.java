package com.touristconnect.controller;

import com.touristconnect.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<com.touristconnect.dto.NotificationDto>> getMyNotifications(
            Authentication authentication) {
        String email = Objects.requireNonNull(authentication.getName());
        return ResponseEntity.ok(notificationService.getMyNotifications(email));
    }

    @PutMapping("/read/{id}")
    public ResponseEntity<Void> markAsRead(@PathVariable @NonNull Long id, Authentication authentication) {
        notificationService.markAsRead(id, Objects.requireNonNull(authentication.getName()));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        String email = Objects.requireNonNull(authentication.getName());
        return ResponseEntity.ok(notificationService.getUnreadCount(email));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(Objects.requireNonNull(authentication.getName()));
        return ResponseEntity.ok().build();
    }
}
