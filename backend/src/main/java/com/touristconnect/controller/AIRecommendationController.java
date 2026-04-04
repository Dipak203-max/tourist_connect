package com.touristconnect.controller;

import com.touristconnect.dto.AIResponseDto;
import com.touristconnect.entity.User;
import com.touristconnect.service.AIRecommendationService;
import com.touristconnect.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/recommend")
public class AIRecommendationController {

    @Autowired
    private AIRecommendationService aiRecommendationService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<AIResponseDto> getRecommendations(
            @RequestParam Double lat,
            @RequestParam Double lng) {
        User currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(aiRecommendationService.getRecommendations(currentUser, lat, lng));
    }
}
