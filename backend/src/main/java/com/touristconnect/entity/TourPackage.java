package com.touristconnect.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tour_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double pricePerPerson;

    private String duration; // e.g., "12 Days", "3 Hours"

    private Double rating;

    private String imageUrl;

    private String category; // e.g., "Adventure", "Culture", "Popular"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guide_profile_id", nullable = false)
    private GuideProfile guideProfile;
}
