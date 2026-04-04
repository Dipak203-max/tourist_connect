package com.touristconnect.config;

import com.touristconnect.entity.GuideProfile;
import com.touristconnect.entity.TourPackage;
import com.touristconnect.entity.User;
import com.touristconnect.entity.Role;
import com.touristconnect.repository.GuideProfileRepository;
import com.touristconnect.repository.TourPackageRepository;
import com.touristconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private TourPackageRepository tourPackageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GuideProfileRepository guideProfileRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (tourPackageRepository.count() == 0) {
            // Find all guides
            List<User> guides = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.GUIDE)
                    .toList();

            for (User guide : guides) {
                // Ensure profile exists
                GuideProfile profile = guideProfileRepository.findByUser(guide).orElse(null);
                
                if (profile != null) {
                    TourPackage tour1 = new TourPackage();
                    tour1.setTitle("City Sightseeing Tour");
                    tour1.setPricePerPerson(251.0);
                    tour1.setDescription("Discover the hidden gems and major landmarks of our beautiful city in this comprehensive guided tour.");
                    tour1.setDuration("4 Hours");
                    tour1.setCategory("City Tour");
                    tour1.setRating(4.9);
                    tour1.setGuideProfile(profile);
                    tourPackageRepository.save(tour1);

                    TourPackage tour2 = new TourPackage();
                    tour2.setTitle("Mountain Hiking Adventure");
                    tour2.setPricePerPerson(150.0);
                    tour2.setDescription("An intense but rewarding hiking loop passing through scenic alpine landscapes.");
                    tour2.setDuration("8 Hours");
                    tour2.setCategory("Adventure");
                    tour2.setRating(4.8);
                    tour2.setGuideProfile(profile);
                    tourPackageRepository.save(tour2);
                }
            }
            System.out.println("Data Seeder initialized default Tour Packages for existing guides.");
        }
    }
}
