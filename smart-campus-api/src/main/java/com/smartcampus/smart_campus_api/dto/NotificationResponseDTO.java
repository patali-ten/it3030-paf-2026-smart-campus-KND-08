package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDTO {
    private Long id;
    private String title;
    private String message;
    private NotificationType type;
    private String referenceId;
    private boolean read;
    private LocalDateTime createdAt;
}