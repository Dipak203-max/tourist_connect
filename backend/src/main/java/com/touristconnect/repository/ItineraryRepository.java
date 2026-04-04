package com.touristconnect.repository;

import com.touristconnect.entity.Itinerary;
import com.touristconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    List<Itinerary> findByUser(User user);

    List<Itinerary> findByUserOrderByStartDateDesc(User user);

    java.util.Optional<Itinerary> findByShareToken(String shareToken);
}
