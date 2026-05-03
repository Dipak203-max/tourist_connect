package com.touristconnect.service;

import com.touristconnect.dto.TravelStoryDto;
import com.touristconnect.entity.TravelStory;
import com.touristconnect.entity.User;
import com.touristconnect.entity.Visibility;
import com.touristconnect.repository.TravelStoryRepository;
import com.touristconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StoryService {

    @Autowired
    private TravelStoryRepository storyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private FriendService friendService;

    @Autowired
    private com.touristconnect.repository.UserProfileRepository userProfileRepository;

    @Transactional
    public TravelStoryDto createStory(String email, String title, String content, String location, 
                                     com.touristconnect.entity.Visibility visibility, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TravelStory story = new TravelStory();
        story.setUser(user);
        story.setTitle(title);
        story.setContent(content);
        story.setVisibility(visibility != null ? visibility : Visibility.PUBLIC);
        story.setLocation(location);

        if (file != null && !file.isEmpty()) {
            String url = fileStorageService.saveFile(file);
            story.setMediaUrls(java.util.Collections.singletonList(url));
        }

        story.setLikes(0);
        story.setCreatedAt(java.time.LocalDateTime.now());

        TravelStory savedStory = storyRepository.save(story);
        return mapToDto(savedStory);
    }

    @Transactional(readOnly = true)
    public List<TravelStoryDto> getMyStories(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        java.time.LocalDateTime twentyFourHoursAgo = java.time.LocalDateTime.now().minusHours(24);
        return storyRepository.findByUserIdAndCreatedAtAfter(user.getId(), twentyFourHoursAgo).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TravelStoryDto> getPublicFeed() {
        java.time.LocalDateTime twentyFourHoursAgo = java.time.LocalDateTime.now().minusHours(24);
        return storyRepository.findByVisibilityAndCreatedAtAfter(Visibility.PUBLIC, twentyFourHoursAgo).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TravelStoryDto> getFeedForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> friends = friendService.getFriendUsers(user);
        java.time.LocalDateTime twentyFourHoursAgo = java.time.LocalDateTime.now().minusHours(24);

        if (friends.isEmpty()) {
            return storyRepository.findByVisibilityAndCreatedAtAfter(Visibility.PUBLIC, twentyFourHoursAgo).stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }

        return storyRepository.findRecentStoriesForUser(twentyFourHoursAgo, friends).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TravelStoryDto> getUserStories(Long userId, String currentUserEmail) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        java.time.LocalDateTime twentyFourHoursAgo = java.time.LocalDateTime.now().minusHours(24);
        List<TravelStory> stories = storyRepository.findByUserIdAndCreatedAtAfter(userId, twentyFourHoursAgo);
        
        if (currentUserEmail == null) {
            return stories.stream()
                    .filter(s -> s.getVisibility() == Visibility.PUBLIC)
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getId().equals(userId)) {
            return stories.stream().map(this::mapToDto).collect(Collectors.toList());
        }

        boolean isFriend = friendService.getFriendshipStatus(currentUserEmail, userId).equals("FRIENDS");

        return stories.stream()
                .filter(s -> s.getVisibility() == Visibility.PUBLIC || (isFriend && s.getVisibility() == Visibility.FRIENDS_ONLY))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteStory(String email, Long storyId) {
        TravelStory story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found"));
        
        if (!story.getUser().getEmail().equals(email)) {
            throw new RuntimeException("You are not authorized to delete this story");
        }
        
        storyRepository.delete(story);
    }

    private TravelStoryDto mapToDto(TravelStory story) {
        String profilePictureUrl = userProfileRepository.findByUser(story.getUser())
                .map(com.touristconnect.entity.UserProfile::getProfilePictureUrl)
                .orElse(null);

        return new TravelStoryDto(
                story.getId(),
                story.getUser().getId(),
                story.getUser().getUsername(), 
                story.getTitle(),
                story.getContent(),
                story.getMediaUrls(),
                story.getVisibility(),
                story.getLocation(),
                story.getLikes(),
                story.getCreatedAt(),
                profilePictureUrl);
    }
}
