package com.touristconnect.controller;

import com.touristconnect.dto.ChangePasswordRequest;
import com.touristconnect.service.AuthService;
import com.touristconnect.service.UserService;
import com.touristconnect.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
import java.util.List;
import java.io.IOException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload-profile-picture")
    public ResponseEntity<String> uploadProfilePicture(@RequestParam("file") MultipartFile file, Principal principal) throws IOException {
        // Save file to 'profiles' subdirectory
        String fileDownloadUri = fileStorageService.saveFile(file, "profiles");
        userService.updateProfilePicture(principal.getName(), fileDownloadUri);
        return ResponseEntity.ok(fileDownloadUri);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserService.UserDto>> searchUsers(
            @RequestParam String query,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.searchUsers(query, email));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request, Principal principal) {
        return ResponseEntity.ok(authService.changePassword(principal.getName(), request));
    }
}
