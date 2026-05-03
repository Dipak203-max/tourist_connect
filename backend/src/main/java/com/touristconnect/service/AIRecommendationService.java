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
        // Get User Interests
        List<String> interests = profileService.getProfile(user.getEmail()).getInterests();
        if (interests == null) interests = new ArrayList<>();

        // Get User History
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

        // Call FastAPI
        Map<String, Object> request = new HashMap<>();
        request.put("interests", interests);
        request.put("lat", lat);
        request.put("lng", lng);
        request.put("history", history.stream().distinct().collect(Collectors.toList()));

        try {
            AIResponseDto response = restTemplate.postForObject(aiServiceUrl + "/recommend", request, AIResponseDto.class);
            if (response == null || (response.getRestaurants().isEmpty() && response.getActivities().isEmpty())) {
                return getMockRecommendations(lat, lng);
            }
            return response;
        } catch (Exception e) {
            System.err.println("AI Service Connection Failed: " + e.getMessage());
            return getMockRecommendations(lat, lng);
        }
    }

    private AIResponseDto getMockRecommendations(Double lat, Double lng) {
        List<com.touristconnect.dto.PlaceDto> restaurants = new ArrayList<>();
        List<com.touristconnect.dto.PlaceDto> activities = new ArrayList<>();
        List<com.touristconnect.dto.PlaceDto> places = new ArrayList<>();

        restaurants.add(new com.touristconnect.dto.PlaceDto("The Himalayan Cafe", lat + 0.002, lng + 0.002, "cafe", 9.5));
        restaurants.add(new com.touristconnect.dto.PlaceDto("Everest Steak House", lat - 0.003, lng + 0.001, "restaurant", 9.2));
        restaurants.add(new com.touristconnect.dto.PlaceDto("Kathmandu Kitchen", lat + 0.001, lng - 0.004, "restaurant", 8.8));

        activities.add(new com.touristconnect.dto.PlaceDto("Ancient Temple Walk", lat + 0.005, lng + 0.005, "historic", 9.8));
        activities.add(new com.touristconnect.dto.PlaceDto("Mountain Bike Trail", lat - 0.004, lng - 0.002, "activity", 9.1));
        activities.add(new com.touristconnect.dto.PlaceDto("Local Craft Workshop", lat + 0.003, lng - 0.001, "gallery", 8.5));

        places.add(new com.touristconnect.dto.PlaceDto("Panorama Viewpoint", lat + 0.008, lng + 0.002, "viewpoint", 9.7));
        places.add(new com.touristconnect.dto.PlaceDto("Peace Park", lat - 0.002, lng + 0.006, "park", 9.0));
        places.add(new com.touristconnect.dto.PlaceDto("Royal Square", lat + 0.004, lng - 0.003, "monument", 8.9));

        return new AIResponseDto(restaurants, activities, places, false);
    }
}
