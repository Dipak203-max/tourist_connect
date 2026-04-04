package com.touristconnect.dto;

import java.util.List;

public class GuideProfileDto {
    private Long id;
    private Long userId;
    private String guideName;
    private String specialization;
    private int experienceYears;
    private List<String> languages;
    private Double rating;
    private int reviewCount;
    private Double latitude;
    private Double longitude;
    private String city;
    private String country;
    private Double price;
    private boolean available;
    private String bio;
    private String profilePictureUrl;
    private List<String> certifications;
    private List<String> galleryImages;
    private String coverImageUrl;
    private String responseTime;
    private String phoneNumber;
    private String email;
    private boolean verified;

    public GuideProfileDto() {
    }

    public GuideProfileDto(Long id, Long userId, String guideName, String specialization, int experienceYears,
            List<String> languages, Double rating, int reviewCount, Double latitude, Double longitude, String city,
            String country, Double price, boolean available, String bio, String profilePictureUrl,
            List<String> certifications, List<String> galleryImages, String coverImageUrl, String responseTime,
            String phoneNumber, String email, boolean verified) {
        this.id = id;
        this.userId = userId;
        this.guideName = guideName;
        this.specialization = specialization;
        this.experienceYears = experienceYears;
        this.languages = languages;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.latitude = latitude;
        this.longitude = longitude;
        this.city = city;
        this.country = country;
        this.price = price;
        this.available = available;
        this.bio = bio;
        this.profilePictureUrl = profilePictureUrl;
        this.certifications = certifications;
        this.galleryImages = galleryImages;
        this.coverImageUrl = coverImageUrl;
        this.responseTime = responseTime;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.verified = verified;
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

    public String getGuideName() {
        return guideName;
    }

    public void setGuideName(String guideName) {
        this.guideName = guideName;
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

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
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

    public List<String> getCertifications() {
        return certifications;
    }

    public void setCertifications(List<String> certifications) {
        this.certifications = certifications;
    }

    public List<String> getGalleryImages() {
        return galleryImages;
    }

    public void setGalleryImages(List<String> galleryImages) {
        this.galleryImages = galleryImages;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public String getResponseTime() {
        return responseTime;
    }

    public void setResponseTime(String responseTime) {
        this.responseTime = responseTime;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
