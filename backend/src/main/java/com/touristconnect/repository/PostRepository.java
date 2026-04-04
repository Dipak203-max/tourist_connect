package com.touristconnect.repository;

import com.touristconnect.entity.Post;
import com.touristconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserOrderByCreatedAtDesc(User user);

    List<Post> findByUserAndMediaTypeOrderByCreatedAtDesc(User user, String mediaType);

    List<Post> findAllByOrderByCreatedAtDesc();
}
