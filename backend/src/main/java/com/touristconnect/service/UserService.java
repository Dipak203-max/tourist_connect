package com.touristconnect.service;

import com.touristconnect.entity.User;
import com.touristconnect.repository.UserRepository;
import com.touristconnect.repository.FriendRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import com.touristconnect.entity.Role;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }


    @Autowired
    private com.touristconnect.repository.GuideProfileRepository guideProfileRepository;

    @Autowired
    private com.touristconnect.repository.UserProfileRepository userProfileRepository;

    @Transactional
    public User saveUser(User user) {
        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == Role.GUIDE) {
            boolean exists = guideProfileRepository.existsByUserId(savedUser.getId());
            if (!exists) {
                com.touristconnect.entity.GuideProfile profile = new com.touristconnect.entity.GuideProfile();
                profile.setUser(savedUser);
                profile.setAvailable(false);
                profile.setRating(0.0);
                profile.setReviewCount(0);
                profile.setExperienceYears(0);
                profile.setLanguages(java.util.Collections.emptyList());
                profile.setSpecialization("New Guide");
                profile.setPrice(0.0);
                guideProfileRepository.save(profile);
            }
        }
        return savedUser;
    }

    @Transactional(readOnly = true)
    public List<UserDto> searchUsers(String query, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> users = userRepository.searchUsers(query);

        return users.stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .filter(u -> u.getRole() != Role.ADMIN)
                .map(u -> {
                    String profilePictureUrl = userProfileRepository.findByUserId(u.getId())
                            .map(com.touristconnect.entity.UserProfile::getProfilePictureUrl)
                            .orElse(null);
                    return new UserDto(u.getId(), u.getFullName(), u.getUsername(), u.getEmail(), u.getRole(), profilePictureUrl);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateProfilePicture(String email, String profilePictureUrl) {
        User user = findByEmail(email);
        com.touristconnect.entity.UserProfile profile = userProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    com.touristconnect.entity.UserProfile up = new com.touristconnect.entity.UserProfile();
                    up.setUser(user);
                    return up;
                });
        profile.setProfilePictureUrl(profilePictureUrl);
        userProfileRepository.save(profile);
    }

    // Simple DTO for search results
    public static class UserDto {
        private Long id;
        private String fullName;
        private String username;
        private String email;
        private Role role;
        private String profilePictureUrl;

        public UserDto(Long id, String fullName, String username, String email, Role role, String profilePictureUrl) {
            this.id = id;
            this.fullName = fullName;
            this.username = username;
            this.email = email;
            this.role = role;
            this.profilePictureUrl = profilePictureUrl;
        }

        // Getters
        public Long getId() {
            return id;
        }

        public String getFullName() {
            return fullName;
        }

        public String getUsername() {
            return username;
        }

        public String getEmail() {
            return email;
        }

        public Role getRole() {
            return role;
        }

        public String getProfilePictureUrl() {
            return profilePictureUrl;
        }
    }
}
