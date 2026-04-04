package com.touristconnect.controller;

import com.touristconnect.dto.GroupResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private com.touristconnect.service.ChatGroupService chatGroupService;

    @PostMapping("/create")
    public ResponseEntity<GroupResponseDto> createGroup(Authentication authentication,
            @RequestParam @NonNull String name) {
        return ResponseEntity.ok(chatGroupService.createGroup(name, Objects.requireNonNull(authentication.getName())));
    }

    @PostMapping("/{groupId}/add-member/{userId}")
    public ResponseEntity<String> addMember(Authentication authentication, @PathVariable @NonNull Long groupId,
            @PathVariable @NonNull Long userId) {
        try {
            chatGroupService.addMember(groupId, userId, Objects.requireNonNull(authentication.getName()));
            return ResponseEntity.ok("Member added");
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @PostMapping("/{groupId}/remove-member/{userId}")
    public ResponseEntity<String> removeMember(Authentication authentication, @PathVariable @NonNull Long groupId,
            @PathVariable @NonNull Long userId) {
        try {
            chatGroupService.removeMember(groupId, userId, Objects.requireNonNull(authentication.getName()));
            return ResponseEntity.ok("Member removed");
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @GetMapping("/my-groups")
    public ResponseEntity<List<GroupResponseDto>> getMyGroups(Authentication authentication) {
        return ResponseEntity.ok(chatGroupService.getMyGroups(Objects.requireNonNull(authentication.getName())));
    }
}
