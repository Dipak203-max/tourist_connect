package com.touristconnect.service;

import com.touristconnect.dto.AIResponseDto;
import com.touristconnect.entity.FavoriteType;
import com.touristconnect.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIRecommendationService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private FavoriteService favoriteService;

    @Autowired
    private ItineraryService itineraryService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private DestinationService destinationService;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public AIResponseDto getRecommendations(User user, Double lat, Double lng) {
        // 1. Get User Interests
        List<String> interests = profileService.getProfile(user.getEmail()).getInterests();
        if (interests == null) interests = new ArrayList<>();

        // 2. Get User History
        List<String> history = new ArrayList<>();
        
        // From Favorites
        favoriteService.getUserFavorites(user.getEmail()).stream()
                .filter(fav -> fav.getItemType() == FavoriteType.DESTINATION)
                .forEach(fav -> {
                    try {
                        history.add(destinationService.getDestinationById(fav.getItemId()).getName());
                    } catch (Exception e) {}
                });

        // From Itineraries
        itineraryService.getMyItineraries(user.getEmail()).forEach(it -> {
            history.add(it.getTitle());
            if (it.getDays() != null) {
                it.getDays().forEach(day -> {
                    if (day.getItems() != null) {
                        day.getItems().stream()
                                .filter(item -> "DESTINATION".equals(item.getType()))
                                .forEach(item -> {
                                    try {
                                        history.add(destinationService.getDestinationById(item.getReferenceId()).getName());
                                    } catch (Exception e) {}
                                });
                    }
                });
            }
        });

        // From Bookings
        bookingService.getTouristBookings(user).forEach(b -> history.add(b.getGuideName()));

        // 3. Call FastAPI
        Map<String, Object> request = new HashMap<>();
        request.put("interests", interests);
        request.put("lat", lat);
        request.put("lng", lng);
        request.put("history", history.stream().distinct().collect(Collectors.toList()));

        try {
            return restTemplate.postForObject(aiServiceUrl + "/recommend", request, AIResponseDto.class);
        } catch (Exception e) {
            // Fallback: Empty recommendations
            return new AIResponseDto(new ArrayList<>(), new ArrayList<>(), new ArrayList<>());
        }
    }
}
