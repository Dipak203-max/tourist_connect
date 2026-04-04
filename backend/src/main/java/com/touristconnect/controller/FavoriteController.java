package com.touristconnect.controller;

import com.touristconnect.dto.FavoriteRequest;
import com.touristconnect.dto.FavoriteResponse;
import com.touristconnect.entity.FavoriteType;
import com.touristconnect.service.FavoriteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @PostMapping
    public ResponseEntity<?> addFavorite(Authentication auth, @Valid @RequestBody FavoriteRequest request) {
        favoriteService.addToFavorites(auth.getName(), request.getItemId(), request.getItemType());
        return ResponseEntity.ok().body(Map.of("message", "Added to favorites successfully"));
    }

    @DeleteMapping
    public ResponseEntity<?> removeFavorite(Authentication auth, @Valid @RequestBody FavoriteRequest request) {
        favoriteService.removeFromFavorites(auth.getName(), request.getItemId(), request.getItemType());
        return ResponseEntity.ok().body(Map.of("message", "Removed from favorites successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<List<FavoriteResponse>> getMyFavorites(Authentication auth) {
        return ResponseEntity.ok(favoriteService.getUserFavorites(auth.getName()));
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            Authentication auth,
            @RequestParam Long itemId,
            @RequestParam FavoriteType itemType) {
        boolean isFavorite = favoriteService.isFavorite(auth.getName(), itemId, itemType);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isFavorite", isFavorite);
        return ResponseEntity.ok(response);
    }
}
