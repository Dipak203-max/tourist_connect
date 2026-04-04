package com.touristconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetailedGuideProfileDto {
    private GuideProfileDto guide;
    private Map<String, Object> stats;
    private List<TourPackageDto> tours;
    private List<ReviewDto> reviews;
    private Double commissionPercent;
}
