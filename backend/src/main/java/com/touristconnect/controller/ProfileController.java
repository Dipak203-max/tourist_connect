package com.touristconnect.controller;

import com.touristconnect.dto.UserProfileDto;
import com.touristconnect.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @PostMapping
    public ResponseEntity<UserProfileDto> createOrUpdateProfile(Authentication authentication,
            @RequestBody UserProfileDto profileDto) {
        String email = authentication.getName();
        return ResponseEntity.ok(profileService.createOrUpdateProfile(email, profileDto));
    }

    @GetMapping
    public ResponseEntity<UserProfileDto> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(profileService.getProfile(email));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfileByUserId(userId));
    }
}
