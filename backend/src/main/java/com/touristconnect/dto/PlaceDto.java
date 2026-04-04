package com.touristconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlaceDto {
    private String name;
    private Double lat;
    private Double lon;
    private String type;
    private Double relevance_score;
}
