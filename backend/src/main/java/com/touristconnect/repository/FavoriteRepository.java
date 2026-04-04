package com.touristconnect.repository;

import com.touristconnect.entity.Favorite;
import com.touristconnect.entity.FavoriteType;
import com.touristconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByUserOrderByCreatedAtDesc(User user);

    List<Favorite> findByUserAndItemTypeOrderByCreatedAtDesc(User user, FavoriteType itemType);

    boolean existsByUserAndItemIdAndItemType(User user, Long itemId, FavoriteType itemType);

    Optional<Favorite> findByUserAndItemIdAndItemType(User user, Long itemId, FavoriteType itemType);

    void deleteByUserAndItemIdAndItemType(User user, Long itemId, FavoriteType itemType);
}
