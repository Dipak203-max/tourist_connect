package com.touristconnect.repository;

import com.touristconnect.entity.User;
import com.touristconnect.entity.GuideProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GuideProfileRepository extends JpaRepository<GuideProfile, Long> {
        Optional<GuideProfile> findByUser(User user);

        Optional<GuideProfile> findByUserId(Long userId);

        boolean existsByUserId(Long userId);

        @org.springframework.data.jpa.repository.Query(value = "SELECT gp.* FROM guide_profiles gp " +
                        "JOIN users u ON u.id = gp.user_id " +
                        "WHERE (6371 * acos(cos(radians(:lat)) * cos(radians(gp.latitude)) * cos(radians(gp.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(gp.latitude)))) < :radius "
                        +
                        "AND gp.available = true " +
                        "AND u.role = 'GUIDE' " +
                        "AND u.verification_status = 'VERIFIED' " +
                        "AND gp.latitude IS NOT NULL AND gp.longitude IS NOT NULL", nativeQuery = true)
        java.util.List<GuideProfile> findNearbyGuides(
                        @org.springframework.data.repository.query.Param("lat") Double lat,
                        @org.springframework.data.repository.query.Param("lng") Double lng,
                        @org.springframework.data.repository.query.Param("radius") Double radius);

        @org.springframework.data.jpa.repository.Query(value = "SELECT gp.* FROM guide_profiles gp " +
                        "JOIN users u ON u.id = gp.user_id " +
                        "WHERE LOWER(gp.city) LIKE LOWER(CONCAT('%', :city, '%')) " +
                        "AND gp.available = true " +
                        "AND u.role = 'GUIDE' " +
                        "AND u.verification_status = 'VERIFIED' " +
                        "AND gp.latitude IS NOT NULL AND gp.longitude IS NOT NULL", nativeQuery = true)
        java.util.List<GuideProfile> findByCity(@org.springframework.data.repository.query.Param("city") String city);

        @org.springframework.data.jpa.repository.Query(value = "SELECT gp.* FROM guide_profiles gp " +
                        "JOIN users u ON u.id = gp.user_id " +
                        "WHERE gp.available = true " +
                        "AND u.role = 'GUIDE' " +
                        "AND u.verification_status = 'VERIFIED' " +
                        "AND gp.latitude IS NOT NULL AND gp.longitude IS NOT NULL", nativeQuery = true)
        java.util.List<GuideProfile> findAllVerifiedGuides();
}
