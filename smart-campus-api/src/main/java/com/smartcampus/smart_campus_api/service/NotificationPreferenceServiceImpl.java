package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.NotificationPreferenceDTO;
import com.smartcampus.smart_campus_api.exception.ResourceNotFoundException;
import com.smartcampus.smart_campus_api.model.NotificationPreference;
import com.smartcampus.smart_campus_api.model.NotificationType;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.repository.NotificationPreferenceRepository;
import com.smartcampus.smart_campus_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NotificationPreferenceServiceImpl implements NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    @Override
    public NotificationPreferenceDTO getPreferences(Long userId) {
        // If no preference record exists yet, return ALL types enabled (default)
        return preferenceRepository.findByUserId(userId)
                .map(pref -> NotificationPreferenceDTO.builder()
                        .userId(userId)
                        .enabledTypes(pref.getEnabledTypes())
                        .build())
                .orElseGet(() -> NotificationPreferenceDTO.builder()
                        .userId(userId)
                        .enabledTypes(allTypes()) // default = all on
                        .build());
    }

    @Override
    public NotificationPreferenceDTO updatePreferences(Long userId, Set<NotificationType> enabledTypes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> NotificationPreference.builder()
                        .user(user)
                        .enabledTypes(new HashSet<>())
                        .build());

        pref.setEnabledTypes(enabledTypes);
        preferenceRepository.save(pref);

        return NotificationPreferenceDTO.builder()
                .userId(userId)
                .enabledTypes(enabledTypes)
                .build();
    }

    @Override
    public boolean isTypeEnabled(Long userId, NotificationType type) {
        return preferenceRepository.findByUserId(userId)
                .map(pref -> pref.getEnabledTypes().contains(type))
                .orElse(true); // if no preferences saved, all types are enabled by default
    }

    // Helper — returns all possible notification types
    private Set<NotificationType> allTypes() {
        return new HashSet<>(Arrays.asList(NotificationType.values()));
    }
}