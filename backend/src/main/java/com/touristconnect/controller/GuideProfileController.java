package com.touristconnect.controller;

import com.touristconnect.dto.GuideProfileDto;
import com.touristconnect.service.GuideProfileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/guide-profile")
public class GuideProfileController {

    @Autowired
    private GuideProfileService guideProfileService;

    @PostMapping
    public ResponseEntity<GuideProfileDto> createOrUpdateProfile(Authentication authentication,
            @RequestBody GuideProfileDto profileDto) {
        String email = authentication.getName();
        return ResponseEntity.ok(guideProfileService.createOrUpdateProfile(email, profileDto));
    }

    @GetMapping("/me")
    public ResponseEntity<GuideProfileDto> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(guideProfileService.getMyProfile(email));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<GuideProfileDto> getProfileByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(guideProfileService.getProfileByUserId(userId));
    }

    @GetMapping("/detailed/{userId}")
    public ResponseEntity<com.touristconnect.dto.DetailedGuideProfileDto> getDetailedProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(guideProfileService.getDetailedProfile(userId));
    }

    @GetMapping("/search")
    public ResponseEntity<java.util.List<GuideProfileDto>> searchGuides(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radius,
            @RequestParam(required = false) String city) {
        log.info("Incoming search request: lat={}, lng={}, radius={}, city={}", lat, lng, radius, city);
        return ResponseEntity.ok(guideProfileService.searchGuides(lat, lng, radius, city));
    }

    @PostMapping("/location")
    public ResponseEntity<GuideProfileDto> updateLocation(Authentication authentication,
            @RequestBody java.util.Map<String, Object> locationData) {
        String email = authentication.getName();
        Double lat = Double.valueOf(locationData.get("latitude").toString());
        Double lng = Double.valueOf(locationData.get("longitude").toString());
        String city = (String) locationData.get("city");
        return ResponseEntity.ok(guideProfileService.updateLocation(email, lat, lng, city));
    }
}
