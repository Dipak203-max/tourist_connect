package com.touristconnect.service;

import com.touristconnect.dto.FavoriteResponse;
import com.touristconnect.entity.Favorite;
import com.touristconnect.entity.FavoriteType;
import com.touristconnect.entity.Role;
import com.touristconnect.entity.User;
import com.touristconnect.exception.BadRequestException;
import com.touristconnect.exception.ResourceConflictException;
import com.touristconnect.repository.DestinationRepository;
import com.touristconnect.repository.FavoriteRepository;
import com.touristconnect.repository.ItineraryRepository;
import com.touristconnect.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private static final Logger log = LoggerFactory.getLogger(FavoriteService.class);

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void addToFavorites(String userEmail, Long itemId, FavoriteType type) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Admins cannot use the favorites feature.");
        }

        if (favoriteRepository.existsByUserAndItemIdAndItemType(user, itemId, type)) {
            throw new ResourceConflictException("Already in favorites.");
        }

        // Validate that the item exists
        validateItemExistence(itemId, type);

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setItemId(itemId);
        favorite.setItemType(type);
        favorite.setCreatedAt(LocalDateTime.now());

        favoriteRepository.save(favorite);
    }

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private ItineraryRepository itineraryRepository;

    private void validateItemExistence(Long itemId, FavoriteType type) {
        log.info("Favoriting itemId: {}, type: {}", itemId, type);
        boolean exists = false;
        switch (type) {
            case GUIDE:
                Optional<User> userOpt = userRepository.findById(itemId);
                exists = userOpt.isPresent() && userOpt.get().getRole() == Role.GUIDE;
                if (userOpt.isPresent() && !exists) {
                    log.warn("User ID {} is not a GUIDE (Role: {})", itemId, userOpt.get().getRole());
                    throw new BadRequestException("User with ID " + itemId + " is not a GUIDE.");
                }
                break;
            case DESTINATION:
                exists = destinationRepository.existsById(itemId);
                break;
            case ITINERARY:
                exists = itineraryRepository.existsById(itemId);
                break;
            case EXPERIENCE:
                // Placeholder: Assuming Experience module is coming soon
                // For now, let's allow it if we don't have a repo yet, or throw generic error
                exists = true;
                break;
        }

        if (!exists) {
            throw new BadRequestException(type + " with ID " + itemId + " does not exist.");
        }
    }

    @Transactional
    public void removeFromFavorites(String userEmail, Long itemId, FavoriteType type) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        favoriteRepository.findByUserAndItemIdAndItemType(user, itemId, type)
                .ifPresent(favoriteRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<FavoriteResponse> getUserFavorites(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(String userEmail, Long itemId, FavoriteType type) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteRepository.existsByUserAndItemIdAndItemType(user, itemId, type);
    }

    private FavoriteResponse mapToResponse(Favorite favorite) {
        return new FavoriteResponse(
                favorite.getId(),
                favorite.getItemId(),
                favorite.getItemType(),
                favorite.getCreatedAt(),
                null // Additional details can be fetched and populated if needed
        );
    }
}
