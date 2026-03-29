package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.CreateNotificationDTO;
import com.smartcampus.smart_campus_api.dto.NotificationResponseDTO;
import java.util.List;

public interface NotificationService {

    // Called by other members' services to fire a notification
    NotificationResponseDTO createNotification(CreateNotificationDTO dto);

    // Get all notifications for a user (for the notifications tab)
    List<NotificationResponseDTO> getAllNotifications(Long userId);

    // Get only unread ones (for the bell badge)
    List<NotificationResponseDTO> getUnreadNotifications(Long userId);

    // Count of unread (the number shown on bell icon)
    long getUnreadCount(Long userId);

    // Mark one notification as read
    NotificationResponseDTO markAsRead(Long notificationId, Long userId);

    // Mark all as read (user clicks "mark all read")
    void markAllAsRead(Long userId);

    // Delete one notification
    void deleteNotification(Long notificationId, Long userId);
}