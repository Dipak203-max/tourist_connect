package com.touristconnect.service;

import org.springframework.lang.NonNull;

import com.touristconnect.entity.ChatGroup;
import com.touristconnect.entity.User;
import com.touristconnect.repository.ChatGroupRepository;
import com.touristconnect.repository.FriendRequestRepository;
import com.touristconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatGroupService {

    @Autowired
    private ChatGroupRepository chatGroupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Transactional
    public com.touristconnect.dto.GroupResponseDto createGroup(@NonNull String name, @NonNull String creatorEmail) {
        User user = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ChatGroup group = new ChatGroup(name, user);
        ChatGroup savedGroup = chatGroupRepository.save(group);
        return toGroupResponse(savedGroup);
    }

    @Transactional
    public void addMember(@NonNull Long groupId, @NonNull Long userId, @NonNull String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        ChatGroup group = chatGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getCreatedBy().getId().equals(requester.getId())) {
            throw new RuntimeException("Only creator can add members");
        }

        User newMember = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User to add not found"));

        if (!friendRequestRepository.areFriends(requester, newMember)) {
            throw new RuntimeException("User is not a friend");
        }

        group.addMember(newMember);
        chatGroupRepository.save(group);
    }

    @Transactional
    public void removeMember(@NonNull Long groupId, @NonNull Long userId, @NonNull String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        ChatGroup group = chatGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getCreatedBy().getId().equals(requester.getId())) {
            throw new RuntimeException("Only creator can remove members");
        }

        User memberToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User to remove not found"));

        group.removeMember(memberToRemove);
        chatGroupRepository.save(group);
    }

    @Transactional(readOnly = true)
    public List<com.touristconnect.dto.GroupResponseDto> getMyGroups(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<ChatGroup> groups = chatGroupRepository.findByMember(user);
        return groups.stream().map(this::toGroupResponse).collect(java.util.stream.Collectors.toList());
    }

    @NonNull
    private com.touristconnect.dto.GroupResponseDto toGroupResponse(ChatGroup group) {
        return new com.touristconnect.dto.GroupResponseDto(
                group.getId(),
                group.getName(),
                toUserSummary(group.getCreatedBy()),
                group.getMembers().stream().map(this::toUserSummary).collect(java.util.stream.Collectors.toSet()),
                group.getCreatedAt());
    }

    @NonNull
    private com.touristconnect.dto.UserSummaryDto toUserSummary(User user) {
        return new com.touristconnect.dto.UserSummaryDto(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                user.getUsername(), 
                user.getIdentityDocumentUrl() 
                                              
        );
    }
}
