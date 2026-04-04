package com.touristconnect.controller;

import com.touristconnect.dto.ItineraryDto;
import com.touristconnect.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private ItineraryService itineraryService;

    @GetMapping("/itineraries/{token}")
    public ResponseEntity<ItineraryDto> getSharedItinerary(@PathVariable String token) {
        return ResponseEntity.ok(itineraryService.getItineraryByToken(token));
    }
}
