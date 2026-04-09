package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // All notifications for a user, newest first
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long userId);

    // FIX: Changed IsReadFalse to ReadFalse to match the 'read' field in the Entity
    List<Notification> findByRecipientIdAndReadFalseOrderByCreatedAtDesc(Long userId);

    // FIX: Changed IsReadFalse to ReadFalse
    long countByRecipientIdAndReadFalse(Long userId);
}
