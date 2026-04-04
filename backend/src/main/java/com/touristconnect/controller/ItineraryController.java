package com.touristconnect.controller;

import com.touristconnect.dto.ItineraryDto;
import com.touristconnect.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    @PostMapping
    public ResponseEntity<ItineraryDto> createItinerary(Authentication authentication, @RequestBody ItineraryDto dto) {
        String email = authentication.getName();
        return ResponseEntity.ok(itineraryService.createItinerary(email, dto));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ItineraryDto>> getMyItineraries(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(itineraryService.getMyItineraries(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItineraryDto> getItinerary(@PathVariable Long id) {
        return ResponseEntity.ok(itineraryService.getItinerary(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItinerary(Authentication authentication, @PathVariable Long id) {
        String email = authentication.getName();
        itineraryService.deleteItinerary(id, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<ItineraryDto> shareItinerary(Authentication authentication, @PathVariable Long id) {
        String email = authentication.getName();
        return ResponseEntity.ok(itineraryService.shareItinerary(id, email));
    }

    @PostMapping("/{id}/days")
    public ResponseEntity<ItineraryDto> addDay(Authentication authentication, @PathVariable Long id) {
        String email = authentication.getName();
        return ResponseEntity.ok(itineraryService.addDay(id, email));
    }

    @PostMapping("/{id}/days/{dayId}/items")
    public ResponseEntity<ItineraryDto> addItem(Authentication authentication, @PathVariable Long id,
            @PathVariable Long dayId, @RequestBody ItineraryDto.ItineraryItemDto itemDto) {
        String email = authentication.getName();
        return ResponseEntity.ok(itineraryService.addItemToDay(id, dayId, itemDto, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItineraryDto> updateItinerary(Authentication authentication, @PathVariable Long id,
            @RequestBody ItineraryDto dto) {
        String email = authentication.getName();
        return ResponseEntity.ok(itineraryService.updateItinerary(id, dto, email));
    }

    @PutMapping("/{id}/days/{dayId}/items/{itemId}")
    public ResponseEntity<ItineraryDto> updateItem(Authentication authentication, @PathVariable Long id,
            @PathVariable Long dayId, @PathVariable Long itemId, @RequestBody ItineraryDto.ItineraryItemDto itemDto) {
        String email = authentication.getName();
        return ResponseEntity.ok(itineraryService.updateItem(id, dayId, itemId, itemDto, email));
    }

    @DeleteMapping("/{id}/days/{dayId}/items/{itemId}")
    public ResponseEntity<Void> deleteItem(Authentication authentication, @PathVariable Long id,
            @PathVariable Long dayId, @PathVariable Long itemId) {
        String email = authentication.getName();
        itineraryService.deleteItem(id, dayId, itemId, email);
        return ResponseEntity.noContent().build();
    }
}
