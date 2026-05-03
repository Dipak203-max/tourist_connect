package com.touristconnect.controller;

import com.touristconnect.entity.TourPackage;
import com.touristconnect.entity.User;
import com.touristconnect.entity.GuideProfile;
import com.touristconnect.repository.TourPackageRepository;
import com.touristconnect.repository.UserRepository;
import com.touristconnect.repository.GuideProfileRepository;
import com.touristconnect.dto.TourPackageDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tours")
public class TourController {

    @Autowired
    private TourPackageRepository tourPackageRepository;

    @Autowired
    private GuideProfileRepository guideProfileRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/guide/{guideId}")
    public ResponseEntity<List<TourPackageDto>> getToursByGuide(@PathVariable Long guideId) {
        User guideUser = userRepository.findById(guideId).orElse(null);
        if (guideUser == null) return ResponseEntity.ok(new ArrayList<>());
        
        GuideProfile profile = guideProfileRepository.findByUser(guideUser).orElse(null);
        if (profile == null) return ResponseEntity.ok(new ArrayList<>());

        List<TourPackage> tours = tourPackageRepository.findByGuideProfileId(profile.getId());
        List<TourPackageDto> dtos = tours.stream().map(this::convertToDto).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<TourPackageDto> createTourPackage(@RequestBody TourPackageDto tourPackageDto, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        GuideProfile profile = guideProfileRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Guide profile not found"));
        
        TourPackage tour = TourPackage.builder()
                .title(tourPackageDto.getTitle())
                .description(tourPackageDto.getDescription())
                .pricePerPerson(tourPackageDto.getPricePerPerson())
                .duration(tourPackageDto.getDuration())
                .imageUrl(tourPackageDto.getImageUrl())
                .category(tourPackageDto.getCategory())
                .rating(0.0)
                .guideProfile(profile)
                .build();
        
        TourPackage saved = tourPackageRepository.save(tour);
        return ResponseEntity.ok(convertToDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTourPackage(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        GuideProfile profile = guideProfileRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Guide profile not found"));
        
        TourPackage tour = tourPackageRepository.findById(id).orElseThrow(() -> new RuntimeException("Tour not found"));
        if (!tour.getGuideProfile().getId().equals(profile.getId())) {
             return ResponseEntity.status(403).build();
        }
        
        tourPackageRepository.delete(tour);
        return ResponseEntity.ok().build();
    }

    private TourPackageDto convertToDto(TourPackage tour) {
        return TourPackageDto.builder()
                .id(tour.getId())
                .title(tour.getTitle())
                .description(tour.getDescription())
                .pricePerPerson(tour.getPricePerPerson())
                .duration(tour.getDuration())
                .rating(tour.getRating())
                .imageUrl(tour.getImageUrl())
                .category(tour.getCategory())
                .build();
    }
}
