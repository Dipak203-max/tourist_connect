package com.touristconnect.controller;

import com.touristconnect.dto.FriendRequestDto;
import com.touristconnect.service.FriendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private FriendService friendService;

    @GetMapping("/status/{userId}")
    public ResponseEntity<Map<String, String>> getFriendshipStatus(Authentication authentication, @PathVariable Long userId) {
        String email = authentication.getName();
        return ResponseEntity.ok(Map.of("status", friendService.getFriendshipStatus(email, userId)));
    }

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<String> sendFriendRequest(Authentication authentication, @PathVariable Long receiverId) {
        String email = authentication.getName();
        return ResponseEntity.ok(friendService.sendFriendRequest(email, receiverId));
    }

    @PostMapping("/accept/{requestId}")
    public ResponseEntity<String> acceptFriendRequest(Authentication authentication, @PathVariable Long requestId) {
        String email = authentication.getName();
        return ResponseEntity.ok(friendService.acceptFriendRequest(email, requestId));
    }

    @PostMapping("/reject/{requestId}")
    public ResponseEntity<String> rejectFriendRequest(Authentication authentication, @PathVariable Long requestId) {
        String email = authentication.getName();
        return ResponseEntity.ok(friendService.rejectFriendRequest(email, requestId));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<FriendRequestDto>> getPendingRequests(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(friendService.getPendingRequests(email));
    }

    @GetMapping
    public ResponseEntity<List<com.touristconnect.dto.UserDto>> getFriends(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(friendService.getFriends(email));
    }

    @GetMapping("/users/{userId}/friends")
    public ResponseEntity<List<com.touristconnect.dto.UserDto>> getUserFriends(@PathVariable Long userId) {
        return ResponseEntity.ok(friendService.getFriendsByUserId(userId));
    }
}
