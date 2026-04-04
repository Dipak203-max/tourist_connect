package com.touristconnect.repository;

import com.touristconnect.entity.ChatGroup;
import com.touristconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {

    @Query("SELECT cg FROM ChatGroup cg JOIN cg.members m WHERE m = :user")
    List<ChatGroup> findByMember(@Param("user") User user);
}
