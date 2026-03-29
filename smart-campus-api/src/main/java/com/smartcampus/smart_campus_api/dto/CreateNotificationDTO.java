package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNotificationDTO {
    private Long recipientUserId;
    private String title;
    private String message;
    private NotificationType type;
    private String referenceId; // e.g., "BOOKING-12" or "TICKET-5"
}
//This is what OTHER members call from their code to trigger a notification