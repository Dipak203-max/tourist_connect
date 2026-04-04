package com.touristconnect.dto;

public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private String username;
    private String profilePictureUrl;

    public UserDto() {
    }

    public UserDto(Long id, String fullName, String email, String username, String profilePictureUrl) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.username = username;
        this.profilePictureUrl = profilePictureUrl;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
}
