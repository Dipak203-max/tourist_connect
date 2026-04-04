package com.touristconnect.controller;

import com.touristconnect.entity.User;
import com.touristconnect.dto.PostDto;
import com.touristconnect.service.PostService;
import com.touristconnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<?> createPost(
            Authentication auth,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String feeling,
            @RequestParam(required = false) String location) {
        try {
            String email = auth.getName();
            User user = userService.findByEmail(email);
            return ResponseEntity.ok(postService.createPost(user, content, file, feeling, location));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error saving file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Post creation failed: " + e.getMessage());
        }
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostDto>> getFeed() {
        return ResponseEntity.ok(postService.getFeed());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDto>> getUserPosts(@PathVariable Long userId) {
        if (!userService.existsById(userId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "User not found");
        }
        User user = userService.findById(userId);
        return ResponseEntity.ok(postService.getUserPosts(user));
    }

    @GetMapping("/user/{userId}/media")
    public ResponseEntity<List<PostDto>> getMediaPosts(@PathVariable Long userId,
            @RequestParam String type) {
        User user = userService.findById(userId);
        return ResponseEntity.ok(postService.getUserMediaPosts(user, type));
    }

    @GetMapping("/users/{userId}/posts")
    public ResponseEntity<List<PostDto>> getPostsByUserId(@PathVariable Long userId) {
        return getUserPosts(userId);
    }
}
