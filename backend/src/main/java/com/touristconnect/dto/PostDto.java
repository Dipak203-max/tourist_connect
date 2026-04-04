package com.touristconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostDto {
    private Long id;
    private String content;
    private String location;
    private String feeling;
    private String mediaUrl;
    private String mediaType;
    private LocalDateTime createdAt;
    private Long userId;
    private String username;
    private String fullName;
}
