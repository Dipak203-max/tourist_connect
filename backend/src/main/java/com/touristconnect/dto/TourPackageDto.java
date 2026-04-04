package com.touristconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TourPackageDto {
    private Long id;
    private String title;
    private String description;
    private Double pricePerPerson;
    private String duration;
    private Double rating;
    private String imageUrl;
    private String category;
}
