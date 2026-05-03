package com.touristconnect.service;

import org.springframework.lang.NonNull;

import com.touristconnect.entity.ChatGroup;
import com.touristconnect.entity.User;
import com.touristconnect.repository.ChatGroupRepository;
import com.touristconnect.repository.FriendRequestRepository;
import com.touristconnect.repository.UserRepository;
import com.touristconnect.entity.NotificationType;
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

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public com.touristconnect.dto.GroupResponseDto createGroup(@NonNull String name, @NonNull String creatorEmail) {
        User user = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ChatGroup group = new ChatGroup(name, user);
        ChatGroup savedGroup = chatGroupRepository.save(group);
        
        // Notify creator
        notificationService.createNotification(user, 
            "You created group: " + name, NotificationType.GROUP_UPDATE, null, null, savedGroup.getId());
            
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

        // Notify all members
        group.getMembers().forEach(member -> {
            String nameToUse = newMember.getFullName() != null ? newMember.getFullName() : (newMember.getUsername() != null ? newMember.getUsername() : newMember.getEmail());
            notificationService.createNotification(member, 
                (member.getId().equals(newMember.getId()) ? "You were added to " : nameToUse + " joined ") + group.getName(), 
                NotificationType.GROUP_UPDATE, group.getId(), null, group.getId());
        });
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

        // Mark all group notifications as read for the removed member
        notificationService.markGroupNotificationsAsRead(groupId, memberToRemove.getEmail());

        // Notify members (including the one removed)
        notificationService.createNotification(memberToRemove, 
            "You were removed from " + group.getName(), 
            NotificationType.GROUP_UPDATE, group.getId(), null, group.getId());

        group.getMembers().forEach(member -> {
            String nameToUse = memberToRemove.getFullName() != null ? memberToRemove.getFullName() : (memberToRemove.getUsername() != null ? memberToRemove.getUsername() : memberToRemove.getEmail());
            notificationService.createNotification(member, 
                nameToUse + " left " + group.getName(), 
                NotificationType.GROUP_UPDATE, group.getId(), null, group.getId());
        });
    }

    @Transactional
    public void deleteGroup(@NonNull Long groupId, @NonNull String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatGroup group = chatGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getCreatedBy().getId().equals(requester.getId())) {
            throw new RuntimeException("Only the creator can delete the group");
        }

        java.util.Set<User> membersToNotify = new java.util.HashSet<>(group.getMembers());
        String groupName = group.getName();
        Long currentGroupId = group.getId();

        chatGroupRepository.delete(group);

        // Notify all former members
        membersToNotify.forEach(member -> {
            notificationService.createNotification(member, 
                "Group " + groupName + " has been dissolved", 
                NotificationType.GROUP_UPDATE, currentGroupId, null, currentGroupId);
        });
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
