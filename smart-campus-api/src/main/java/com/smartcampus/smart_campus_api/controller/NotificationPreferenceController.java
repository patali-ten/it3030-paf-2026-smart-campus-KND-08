package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.dto.NotificationPreferenceDTO;
import com.smartcampus.smart_campus_api.model.NotificationType;
import com.smartcampus.smart_campus_api.service.NotificationPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/notification-preferences")
@RequiredArgsConstructor
public class NotificationPreferenceController {

    private final NotificationPreferenceService preferenceService;

    // GET /api/v1/notification-preferences/{userId}
    // Returns current preferences (all enabled by default if never set)
    @GetMapping("/{userId}")
    public ResponseEntity<NotificationPreferenceDTO> getPreferences(@PathVariable Long userId) {
        return ResponseEntity.ok(preferenceService.getPreferences(userId));
    }

    // PUT /api/v1/notification-preferences/{userId}
    // Body: { "enabledTypes": ["BOOKING_APPROVED", "NEW_COMMENT"] }
    // Saves the full set of enabled types for this user
    @PutMapping("/{userId}")
    public ResponseEntity<NotificationPreferenceDTO> updatePreferences(
            @PathVariable Long userId,
            @RequestBody Set<NotificationType> enabledTypes) {
        return ResponseEntity.ok(preferenceService.updatePreferences(userId, enabledTypes));
    }
}