package com.touristconnect.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final String baseUploadDir = "uploads";

    public String saveFile(MultipartFile file, String subDir) throws IOException {
        Path uploadPath = Paths.get(baseUploadDir, subDir);

        // If 'uploads' exists in parent but not locally, use parent
        if (!Files.exists(uploadPath) && Files.exists(Paths.get("..", baseUploadDir))) {
            uploadPath = Paths.get("..", baseUploadDir, subDir);
        }

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "file_" + UUID.randomUUID();
        }
        String fileName = UUID.randomUUID() + "_" + originalFilename.replaceAll("\\s+", "_");
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath);

        // Return relative path for static resource mapping
        return "/uploads/" + subDir + "/" + fileName;
    }

    public String saveFile(MultipartFile file) throws IOException {
        return saveFile(file, "posts");
    }
}
