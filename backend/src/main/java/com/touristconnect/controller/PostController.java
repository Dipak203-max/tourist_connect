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
    public ResponseEntity<List<PostDto>> getFeed(Authentication auth) {
        User currentUser = null;
        if (auth != null) {
            currentUser = userService.findByEmail(auth.getName());
        }
        return ResponseEntity.ok(postService.getFeed(currentUser));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostDto>> getUserPosts(@PathVariable Long userId, Authentication auth) {
        if (!userService.existsById(userId)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND,
                    "User not found");
        }
        User user = userService.findById(userId);
        User currentUser = null;
        if (auth != null) {
            currentUser = userService.findByEmail(auth.getName());
        }
        return ResponseEntity.ok(postService.getUserPosts(user, currentUser));
    }

    @GetMapping("/user/{userId}/media")
    public ResponseEntity<List<PostDto>> getMediaPosts(@PathVariable Long userId,
            @RequestParam String type, Authentication auth) {
        User user = userService.findById(userId);
        User currentUser = null;
        if (auth != null) {
            currentUser = userService.findByEmail(auth.getName());
        }
        return ResponseEntity.ok(postService.getUserMediaPosts(user, type, currentUser));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<PostDto> toggleLike(@PathVariable Long postId, Authentication auth) {
        User currentUser = userService.findByEmail(auth.getName());
        return ResponseEntity.ok(postService.toggleLike(postId, currentUser));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<com.touristconnect.dto.CommentDto> addComment(
            @PathVariable Long postId,
            @RequestBody String content,
            Authentication auth) {
        User currentUser = userService.findByEmail(auth.getName());
        return ResponseEntity.ok(postService.addComment(postId, currentUser, content));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId, Authentication auth) {
        try {
            User currentUser = userService.findByEmail(auth.getName());
            postService.deletePost(postId, currentUser);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @GetMapping("/users/{userId}/posts")
    public ResponseEntity<List<PostDto>> getPostsByUserId(@PathVariable Long userId, Authentication auth) {
        return getUserPosts(userId, auth);
    }
}
