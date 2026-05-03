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
    public ResponseEntity<?> createStory(Authentication authentication,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) com.touristconnect.entity.Visibility visibility,
            @RequestParam(required = false) org.springframework.web.multipart.MultipartFile file) {
        try {
            String email = authentication.getName();
            return ResponseEntity.ok(storyService.createStory(email, title, content, location, visibility, file));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Story creation failed: " + e.getMessage());
        }
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

    @GetMapping("/feed-friends")
    public ResponseEntity<List<TravelStoryDto>> getFriendsFeed(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(storyService.getFeedForUser(email));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TravelStoryDto>> getUserStories(@PathVariable Long userId, Authentication authentication) {
        String currentUserEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(storyService.getUserStories(userId, currentUserEmail));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStory(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            storyService.deleteStory(email, id);
            return ResponseEntity.ok("Story deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete story: " + e.getMessage());
        }
    }
}
