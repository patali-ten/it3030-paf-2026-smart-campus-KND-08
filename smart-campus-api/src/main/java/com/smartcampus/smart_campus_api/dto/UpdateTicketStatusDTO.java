package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTicketStatusDTO {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    // Required only when status = REJECTED
    private String rejectionReason;

    // Required only when status = RESOLVED
    private String resolutionNote;

    @NotNull(message = "User ID is required")
    private Long updatedByUserId;
}