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

    @Transactional
    public TravelStoryDto createStory(String email, TravelStoryDto storyDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TravelStory story = new TravelStory();
        story.setUser(user);
        story.setTitle(storyDto.getTitle());
        story.setContent(storyDto.getContent());
        story.setMediaUrls(storyDto.getMediaUrls());
        story.setVisibility(storyDto.getVisibility() != null ? storyDto.getVisibility() : Visibility.PUBLIC);
        story.setLocation(storyDto.getLocation());

        // Ensure defaults
        if (story.getLikes() == 0)
            story.setLikes(0);
        if (story.getCreatedAt() == null)
            story.setCreatedAt(java.time.LocalDateTime.now());

        TravelStory savedStory = storyRepository.save(story);

        return mapToDto(savedStory);
    }

    @Transactional(readOnly = true)
    public List<TravelStoryDto> getMyStories(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return storyRepository.findByUser(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TravelStoryDto> getPublicFeed() {
        return storyRepository.findByVisibility(Visibility.PUBLIC).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private TravelStoryDto mapToDto(TravelStory story) {
        return new TravelStoryDto(
                story.getId(),
                story.getUser().getId(),
                story.getUser().getEmail(),
                story.getTitle(),
                story.getContent(),
                story.getMediaUrls(),
                story.getVisibility(),
                story.getLocation(),
                story.getLikes(),
                story.getCreatedAt());
    }
}
