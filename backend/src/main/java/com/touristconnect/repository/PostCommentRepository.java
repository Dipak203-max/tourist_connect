package com.touristconnect.repository;

import com.touristconnect.entity.Post;
import com.touristconnect.entity.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    List<PostComment> findByPostOrderByCreatedAtDesc(Post post);
    long countByPost(Post post);
}
