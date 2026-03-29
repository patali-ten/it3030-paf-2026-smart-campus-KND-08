package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.dto.CreateNotificationDTO;
import com.smartcampus.smart_campus_api.dto.NotificationResponseDTO;
import com.smartcampus.smart_campus_api.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // ENDPOINT 1 — GET all notifications for a user (for notifications tab/page)
    // GET /api/v1/notifications/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponseDTO>> getAllNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getAllNotifications(userId));
    }

    // ENDPOINT 2 — GET unread count (for the bell badge number)
    // GET /api/v1/notifications/user/{userId}/unread-count
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(userId)));
    }

    // ENDPOINT 3 — PUT mark a single notification as read (user clicks a notification)
    // PUT /api/v1/notifications/{notificationId}/read?userId=5
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId, userId));
    }

    // ENDPOINT 4 — PUT mark ALL notifications as read
    // PUT /api/v1/notifications/user/{userId}/read-all
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    // ENDPOINT 5 — DELETE a notification
    // DELETE /api/v1/notifications/{notificationId}?userId=5
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId,
            @RequestParam Long userId) {
        notificationService.deleteNotification(notificationId, userId);
        return ResponseEntity.noContent().build();
    }

    // Internal endpoint — called by other members' services to create notifications
    // POST /api/v1/notifications
    @PostMapping
    public ResponseEntity<NotificationResponseDTO> createNotification(
            @RequestBody CreateNotificationDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.createNotification(dto));
    }
}