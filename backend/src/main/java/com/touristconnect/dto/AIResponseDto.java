package com.touristconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AIResponseDto {
    private List<PlaceDto> restaurants;
    private List<PlaceDto> activities;
    private List<PlaceDto> places;
    @JsonProperty("is_live")
    private boolean is_live;
}
