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
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private com.touristconnect.repository.GuideProfileRepository guideProfileRepository;

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
                .filter(u -> !friendRequestRepository.areFriends(currentUser, u))

                .filter(u -> !friendRequestRepository.existsBySenderAndReceiver(currentUser, u))
                .filter(u -> !friendRequestRepository.existsBySenderAndReceiver(u, currentUser))
                .map(u -> new UserDto(u.getId(), u.getEmail(), u.getRole()))
                .collect(Collectors.toList());
    }

    // Simple DTO for search results
    public static class UserDto {
        private Long id;
        private String email;
        private Role role;

        public UserDto(Long id, String email, Role role) {
            this.id = id;
            this.email = email;
            this.role = role;
        }

        // Getters
        public Long getId() {
            return id;
        }

        public String getEmail() {
            return email;
        }

        public Role getRole() {
            return role;
        }
    }
}
