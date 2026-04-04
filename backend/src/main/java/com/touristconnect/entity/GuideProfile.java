package com.touristconnect.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "guide_profiles")
public class GuideProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double price;

    private String specialization;

    @Column(name = "experience_years")
    private int experienceYears;

    @ElementCollection
    @CollectionTable(name = "guide_languages", joinColumns = @JoinColumn(name = "guide_profile_id"))
    @Column(name = "language")
    private List<String> languages;

    private Double rating;

    @Column(name = "review_count")
    private int reviewCount;

    private Double latitude;
    private Double longitude;
    private String city;
    private String country;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @ElementCollection
    @CollectionTable(name = "guide_certifications", joinColumns = @JoinColumn(name = "guide_profile_id"))
    @Column(name = "certification")
    private List<String> certifications;

    @Column(name = "response_time")
    private String responseTime;

    @ElementCollection
    @CollectionTable(name = "guide_gallery", joinColumns = @JoinColumn(name = "guide_profile_id"))
    @Column(name = "image_url")
    private List<String> galleryImages;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(columnDefinition = "boolean default true")
    private boolean available = true;

    @Column(columnDefinition = "boolean default false")
    private boolean verified = false;

    // Constructors, Getters, and Setters
    public GuideProfile() {
    }

    public GuideProfile(User user, String specialization, int experienceYears, List<String> languages, Double price) {
        this.user = user;
        this.specialization = specialization;
        this.experienceYears = experienceYears;
        this.languages = languages;
        this.price = price;
        this.rating = 0.0;
        this.reviewCount = 0;
        this.available = true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
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

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public List<String> getCertifications() {
        return certifications;
    }

    public void setCertifications(List<String> certifications) {
        this.certifications = certifications;
    }

    public String getResponseTime() {
        return responseTime;
    }

    public void setResponseTime(String responseTime) {
        this.responseTime = responseTime;
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
}
