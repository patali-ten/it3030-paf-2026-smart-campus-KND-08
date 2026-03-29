package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // All notifications for a user, newest first
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId);

    // Only unread notifications
    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // Count of unread (for the badge number)
    long countByRecipientIdAndIsReadFalse(Long userId);
}
