package com.touristconnect.dto;

import com.touristconnect.entity.VerificationStatus;
import java.time.LocalDateTime;
import java.util.List;

public class AdminGuideDto {
    private Long id;
    private String name;
    private String email;
    private String specialization;
    private int experienceYears;
    private List<String> languages;
    private VerificationStatus verificationStatus;
    private LocalDateTime createdAt;

    // License docs URLs could be added here if needed

    public AdminGuideDto(Long id, String name, String email, String specialization, int experienceYears,
            List<String> languages, VerificationStatus verificationStatus, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.specialization = specialization;
        this.experienceYears = experienceYears;
        this.languages = languages;
        this.verificationStatus = verificationStatus;
        this.createdAt = createdAt;
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

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public int getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(int experienceYears) {
        this.experienceYears = experienceYears;
    }

    public List<String> getLanguages() {
        return languages;
    }

    public void setLanguages(List<String> languages) {
        this.languages = languages;
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
}
