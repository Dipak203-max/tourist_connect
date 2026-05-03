package com.touristconnect.repository;

import com.touristconnect.entity.Notification;
import com.touristconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndIsReadFalse(User user);

    long countByUserAndIsReadFalseAndGroupIdIsNull(User user);

    long countByUserAndIsReadFalseAndGroupIdIsNotNullAndType(User user, com.touristconnect.entity.NotificationType type);

    List<Notification> findByUserAndIsReadFalseAndGroupIdIsNotNullAndType(User user, com.touristconnect.entity.NotificationType type);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.isRead = false AND n.type = :type AND n.groupId IS NOT NULL AND n.groupId IN (SELECT cg.id FROM ChatGroup cg JOIN cg.members m WHERE m = :user)")
    long countUnreadForActiveGroups(@Param("user") User user, @Param("type") com.touristconnect.entity.NotificationType type);

    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.isRead = false AND n.type = :type AND n.groupId IS NOT NULL AND n.groupId IN (SELECT cg.id FROM ChatGroup cg JOIN cg.members m WHERE m = :user)")
    List<Notification> findUnreadForActiveGroups(@Param("user") User user, @Param("type") com.touristconnect.entity.NotificationType type);

    // Count system notifications (all except MESSAGE type)
    long countByUserAndIsReadFalseAndTypeNot(User user, com.touristconnect.entity.NotificationType type);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user = :user AND n.groupId = :groupId AND n.isRead = false")
    void markGroupNotificationsAsRead(@Param("user") User user, @Param("groupId") Long groupId);
}
