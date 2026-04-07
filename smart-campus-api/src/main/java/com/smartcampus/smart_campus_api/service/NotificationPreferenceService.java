package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.NotificationPreferenceDTO;
import com.smartcampus.smart_campus_api.model.NotificationType;
import java.util.Set;

public interface NotificationPreferenceService {

    // Get current preferences for a user
    NotificationPreferenceDTO getPreferences(Long userId);

    // Save/update full preferences for a user
    NotificationPreferenceDTO updatePreferences(Long userId, Set<NotificationType> enabledTypes);

    // Check if a user wants a specific notification type (used internally)
    boolean isTypeEnabled(Long userId, NotificationType type);
}