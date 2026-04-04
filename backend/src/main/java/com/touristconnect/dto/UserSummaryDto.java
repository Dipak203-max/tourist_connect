package com.touristconnect.dto;

public class UserSummaryDto {
    private Long id;
    private String email;
    private String role;
    private String name; // Can be derived or actual field
    private String profilePictureUrl;

    public UserSummaryDto() {
    }

    public UserSummaryDto(Long id, String email, String role, String name, String profilePictureUrl) {
        this.id = id;
        this.email = email;
        this.role = role;
        this.name = name;
        this.profilePictureUrl = profilePictureUrl;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
}
