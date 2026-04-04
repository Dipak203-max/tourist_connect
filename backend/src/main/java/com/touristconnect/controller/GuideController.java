package com.touristconnect.controller;

import com.touristconnect.entity.User;
import com.touristconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/guide")
public class GuideController {

    @Autowired
    private UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping("/upload-documents")
    public ResponseEntity<String> uploadDocuments(@RequestParam("license") MultipartFile license,
            @RequestParam("identity") MultipartFile identity) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getRole().name().equals("GUIDE")) {
            return ResponseEntity.status(403).body("Only guides can upload documents.");
        }

        try {
            // Create upload dir if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save License
            String licenseFileName = UUID.randomUUID() + "_" + license.getOriginalFilename();
            Path licensePath = uploadPath.resolve(licenseFileName);
            Files.copy(license.getInputStream(), licensePath);
            user.setLicenseDocumentUrl(licensePath.toString());

            // Save Identity
            String identityFileName = UUID.randomUUID() + "_" + identity.getOriginalFilename();
            Path identityPath = uploadPath.resolve(identityFileName);
            Files.copy(identity.getInputStream(), identityPath);
            user.setIdentityDocumentUrl(identityPath.toString());

            user.setVerifiedGuide(false); 
            userRepository.save(user);

            return ResponseEntity.ok("Documents uploaded successfully. Waiting for admin verification.");

        } catch (IOException e) {
            return ResponseEntity.status(500).body("File upload failed: " + e.getMessage());
        }
    }
}
