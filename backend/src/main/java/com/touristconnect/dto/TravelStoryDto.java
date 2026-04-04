package com.touristconnect.dto;

import com.touristconnect.entity.Visibility;
import java.time.LocalDateTime;
import java.util.List;

public class TravelStoryDto {
    private Long id;
    private Long userId;
    private String authorName;
    private String title;
    private String content;
    private List<String> mediaUrls;
    private Visibility visibility;
    private String location;
    private int likes;
    private LocalDateTime createdAt;

    public TravelStoryDto() {
    }

    public TravelStoryDto(Long id, Long userId, String authorName, String title, String content, List<String> mediaUrls,
            Visibility visibility, String location, int likes, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.authorName = authorName;
        this.title = title;
        this.content = content;
        this.mediaUrls = mediaUrls;
        this.visibility = visibility;
        this.location = location;
        this.likes = likes;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public Visibility getVisibility() {
        return visibility;
    }

    public void setVisibility(Visibility visibility) {
        this.visibility = visibility;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
