package com.touristconnect.repository;

import com.touristconnect.entity.TravelStory;
import com.touristconnect.entity.User;
import com.touristconnect.entity.Visibility;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TravelStoryRepository extends JpaRepository<TravelStory, Long> {
    List<TravelStory> findByUser(User user);

    List<TravelStory> findByVisibilityAndCreatedAtAfter(Visibility visibility, java.time.LocalDateTime time);

    List<TravelStory> findByUserIdAndCreatedAtAfter(Long userId, java.time.LocalDateTime time);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM TravelStory s WHERE s.createdAt > :time AND (s.visibility = 'PUBLIC' OR (s.visibility = 'FRIENDS_ONLY' AND s.user IN :friends))")
    List<TravelStory> findRecentStoriesForUser(java.time.LocalDateTime time, java.util.List<User> friends);
}
