package com.touristconnect.repository;

import com.touristconnect.entity.TravelStory;
import com.touristconnect.entity.User;
import com.touristconnect.entity.Visibility;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TravelStoryRepository extends JpaRepository<TravelStory, Long> {
    List<TravelStory> findByUser(User user);

    List<TravelStory> findByVisibility(Visibility visibility);

    List<TravelStory> findByUserId(Long userId);
}
