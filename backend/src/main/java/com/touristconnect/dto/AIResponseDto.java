package com.touristconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AIResponseDto {
    private List<PlaceDto> restaurants;
    private List<PlaceDto> activities;
    private List<PlaceDto> places;
}
