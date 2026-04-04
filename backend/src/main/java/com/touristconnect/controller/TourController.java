package com.touristconnect.controller;

import com.touristconnect.entity.TourPackage;
import com.touristconnect.entity.User;
import com.touristconnect.entity.GuideProfile;
import com.touristconnect.repository.TourPackageRepository;
import com.touristconnect.repository.UserRepository;
import com.touristconnect.repository.GuideProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

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
    public ResponseEntity<List<TourPackage>> getToursByGuide(@PathVariable Long guideId) {
        User guideUser = userRepository.findById(guideId).orElse(null);
        if (guideUser == null) return ResponseEntity.ok(new ArrayList<>());
        
        GuideProfile profile = guideProfileRepository.findByUser(guideUser).orElse(null);
        if (profile == null) return ResponseEntity.ok(new ArrayList<>());

        List<TourPackage> tours = new ArrayList<>(tourPackageRepository.findByGuideProfileId(profile.getId()));


        return ResponseEntity.ok(tours);
    }
}
