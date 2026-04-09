package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferenceDTO {
    private Long userId;
    private Set<NotificationType> enabledTypes;
}