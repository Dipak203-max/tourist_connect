package com.touristconnect.service;

import com.touristconnect.dto.FriendRequestDto;
import com.touristconnect.entity.FriendRequest;
import com.touristconnect.entity.FriendRequestStatus;
import com.touristconnect.entity.User;
import com.touristconnect.repository.FriendRequestRepository;
import com.touristconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class FriendService {

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public String sendFriendRequest(String senderEmail, Long receiverId) {
        java.util.Objects.requireNonNull(receiverId, "Receiver ID must not be null");
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver not found"));

        if (sender.getId().equals(receiverId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot send friend request to yourself");
        }

        // 1. Check if already friends
        if (friendRequestRepository.areFriends(sender, receiver)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already friends");
        }

        // 2. Check if a request is already sent (either direction)
        if (friendRequestRepository.existsBySenderAndReceiver(sender, receiver)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Friend request already sent");
        }
        
        // Also check if the other person already sent a request to avoid duplicates
        if (friendRequestRepository.existsBySenderAndReceiver(receiver, sender)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This user has already sent you a friend request");
        }

        FriendRequest request = new FriendRequest(sender, receiver, FriendRequestStatus.PENDING);
        friendRequestRepository.save(request);

        // Notify Receiver
        try {
            String senderName = sender.getUsername() != null ? sender.getUsername() : sender.getEmail();
            notificationService.createNotification(
                    Objects.requireNonNull(receiver),
                    senderName + " sent you a friend request",
                    com.touristconnect.entity.NotificationType.FRIEND_REQUEST,
                    request.getId(),
                    "/notifications");
        } catch (Exception e) {
            // Log error but do not fail the request
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return "Friend request sent successfully";
    }

    @Transactional
    public String acceptFriendRequest(String receiverEmail, Long requestId) {
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getReceiver().getId().equals(receiver.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);

        // Notify Sender
        try {
            String receiverName = receiver.getUsername() != null ? receiver.getUsername() : receiver.getEmail();
            notificationService.createNotification(
                    Objects.requireNonNull(request.getSender()),
                    receiverName + " accepted your friend request",
                    com.touristconnect.entity.NotificationType.FRIEND_ACCEPTED,
                    request.getId(),
                    "/notifications");
        } catch (Exception e) {
            // Log error but do not fail the request
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return "Friend request accepted";
    }

    @Transactional
    public String rejectFriendRequest(String receiverEmail, Long requestId) {
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getReceiver().getId().equals(receiver.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        request.setStatus(FriendRequestStatus.REJECTED);
        friendRequestRepository.save(request);

        return "Friend request rejected";
    }

    @Transactional(readOnly = true)
    public List<FriendRequestDto> getPendingRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return friendRequestRepository.findByReceiverAndStatus(user, FriendRequestStatus.PENDING).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Get Friends (either sender or receiver where status is ACCEPTED)
    @Transactional(readOnly = true)
    public List<com.touristconnect.dto.UserDto> getFriends(String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return getFriendsByUserId(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public List<com.touristconnect.dto.UserDto> getFriendsByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<FriendRequest> accepted = friendRequestRepository.findByStatusAndUser(user.getId(),
                FriendRequestStatus.ACCEPTED);

        return accepted.stream()
                .map(fr -> {
                    User friend;
                    if (fr.getSender().getId().equals(user.getId())) {
                        friend = fr.getReceiver();
                    } else {
                        friend = fr.getSender();
                    }

                    if (friend == null) {
                        return null;
                    }

                    return new com.touristconnect.dto.UserDto(
                            friend.getId(),
                            friend.getFullName(),
                            friend.getEmail(),
                            friend.getUsername(),
                            null);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public String getFriendshipStatus(String email, Long targetUserId) {
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        User receiver = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        if (friendRequestRepository.areFriends(sender, receiver)) {
            return "FRIENDS";
        }
        
        // Check if I sent a request
        if (friendRequestRepository.existsBySenderAndReceiver(sender, receiver)) {
            return "PENDING";
        }
        
        // Check if they sent me a request
        if (friendRequestRepository.existsBySenderAndReceiver(receiver, sender)) {
            return "PENDING"; 
        }

        return "NONE";
    }

    private FriendRequestDto mapToDto(FriendRequest request) {
        return new FriendRequestDto(
                request.getId(),
                request.getSender().getId(),
                request.getSender().getEmail(),
                request.getReceiver().getId(),
                request.getReceiver().getEmail(),
                request.getStatus(),
                request.getSentAt());
    }
}
