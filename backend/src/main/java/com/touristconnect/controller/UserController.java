package com.touristconnect.controller;

import com.touristconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/search")
    public ResponseEntity<List<UserService.UserDto>> searchUsers(
            @RequestParam String query,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.searchUsers(query, email));
    }
}
