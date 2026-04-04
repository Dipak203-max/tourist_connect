package com.touristconnect.service;

import com.touristconnect.dto.UserProfileDto;
import com.touristconnect.entity.User;
import com.touristconnect.entity.UserProfile;
import com.touristconnect.repository.UserProfileRepository;
import com.touristconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

        @Autowired
        private UserProfileRepository userProfileRepository;

        @Autowired
        private UserRepository userRepository;

        @Transactional
        public UserProfileDto createOrUpdateProfile(String email, UserProfileDto profileDto) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                UserProfile profile = userProfileRepository.findByUser(user)
                                .orElse(new UserProfile());

                profile.setCoverPhotoUrl(profileDto.getCoverPhotoUrl());

                if (profile.getUser() == null) {
                        profile.setUser(user);
                }

                // Update User fields
                if (profileDto.getFullName() != null) {
                        user.setFullName(profileDto.getFullName());
                        userRepository.save(user);
                }

                // Update Profile fields
                profile.setBio(profileDto.getBio());
                profile.setLocation(profileDto.getLocation());
                profile.setProfilePictureUrl(profileDto.getProfilePictureUrl());
                profile.setInterests(profileDto.getInterests());

                UserProfile savedProfile = userProfileRepository.save(profile);

                return new UserProfileDto(
                                user.getId(),
                                user.getFullName(),
                                user.getEmail(),
                                savedProfile.getBio(),
                                savedProfile.getProfilePictureUrl(),
                                savedProfile.getLocation(),
                                savedProfile.getInterests(),
                                savedProfile.getCoverPhotoUrl(),
                                user.getCreatedAt());
        }

        @Transactional
        public UserProfileDto getProfile(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "User not found"));

                UserProfile profile = userProfileRepository.findByUser(user)
                                .orElseGet(() -> {
                                        UserProfile newProfile = new UserProfile();
                                        newProfile.setUser(user);
                                        newProfile.setBio("");
                                        newProfile.setLocation("");
                                        newProfile.setInterests(java.util.Collections.emptyList());
                                        return userProfileRepository.save(newProfile);
                                });

                return new UserProfileDto(
                                user.getId(),
                                user.getFullName(),
                                user.getEmail(),
                                profile.getBio(),
                                profile.getProfilePictureUrl(),
                                profile.getLocation(),
                                profile.getInterests(),
                                profile.getCoverPhotoUrl(),
                                user.getCreatedAt());
        }

        @Transactional
        public UserProfileDto getProfileByUserId(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                                org.springframework.http.HttpStatus.NOT_FOUND,
                                                "User not found"));

                UserProfile profile = userProfileRepository.findByUser(user)
                                .orElseGet(() -> {
                                        UserProfile newProfile = new UserProfile();
                                        newProfile.setUser(user);
                                        newProfile.setBio("");
                                        newProfile.setLocation("");
                                        newProfile.setInterests(java.util.Collections.emptyList());
                                        // Save to ensure subsequent calls find it
                                        return userProfileRepository.save(newProfile);
                                });

                return new UserProfileDto(
                                user.getId(),
                                user.getFullName(),
                                user.getEmail(),
                                profile.getBio(),
                                profile.getProfilePictureUrl(),
                                profile.getLocation(),
                                profile.getInterests(),
                                profile.getCoverPhotoUrl(),
                                user.getCreatedAt());
        }
}
