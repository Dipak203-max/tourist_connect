package com.touristconnect.controller;

import com.touristconnect.dto.TravelStoryDto;
import com.touristconnect.service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    @Autowired
    private StoryService storyService;

    @PostMapping
    public ResponseEntity<TravelStoryDto> createStory(Authentication authentication,
            @RequestBody TravelStoryDto storyDto) {
        String email = authentication.getName();
        return ResponseEntity.ok(storyService.createStory(email, storyDto));
    }

    @GetMapping("/my-stories")
    public ResponseEntity<List<TravelStoryDto>> getMyStories(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(storyService.getMyStories(email));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<TravelStoryDto>> getPublicFeed() {
        return ResponseEntity.ok(storyService.getPublicFeed());
    }
}
