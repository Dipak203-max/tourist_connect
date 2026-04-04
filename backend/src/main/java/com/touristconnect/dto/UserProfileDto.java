package com.touristconnect.dto;

import java.util.List;

public class UserProfileDto {
    private Long id;
    private String fullName;
    private String email;
    private String bio;
    private String profilePictureUrl;
    private String location;
    private List<String> interests;
    private String coverPhotoUrl;
    private java.time.LocalDateTime joinedDate;

    public UserProfileDto() {
    }

    public UserProfileDto(Long id, String fullName, String email, String bio, String profilePictureUrl, String location,
            List<String> interests, String coverPhotoUrl, java.time.LocalDateTime joinedDate) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.bio = bio;
        this.profilePictureUrl = profilePictureUrl;
        this.location = location;
        this.interests = interests;
        this.coverPhotoUrl = coverPhotoUrl;
        this.joinedDate = joinedDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public String getCoverPhotoUrl() {
        return coverPhotoUrl;
    }

    public void setCoverPhotoUrl(String coverPhotoUrl) {
        this.coverPhotoUrl = coverPhotoUrl;
    }

    public java.time.LocalDateTime getJoinedDate() {
        return joinedDate;
    }

    public void setJoinedDate(java.time.LocalDateTime joinedDate) {
        this.joinedDate = joinedDate;
    }
}
