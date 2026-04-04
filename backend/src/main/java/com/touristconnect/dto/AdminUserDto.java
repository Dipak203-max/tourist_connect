package com.touristconnect.dto;

import java.time.LocalDateTime;
import com.touristconnect.entity.Role;
import com.touristconnect.entity.VerificationStatus;

public class AdminUserDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean isBlocked;
    private VerificationStatus verificationStatus;
    private LocalDateTime createdAt;
    private boolean isVerifiedGuide;

    public AdminUserDto(Long id, String name, String email, Role role, boolean isBlocked,
            VerificationStatus verificationStatus, LocalDateTime createdAt, boolean isVerifiedGuide) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.isBlocked = isBlocked;
        this.verificationStatus = verificationStatus;
        this.createdAt = createdAt;
        this.isVerifiedGuide = isVerifiedGuide;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isBlocked() {
        return isBlocked;
    }

    public void setBlocked(boolean blocked) {
        isBlocked = blocked;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isVerifiedGuide() {
        return isVerifiedGuide;
    }

    public void setVerifiedGuide(boolean verifiedGuide) {
        isVerifiedGuide = verifiedGuide;
    }
}
