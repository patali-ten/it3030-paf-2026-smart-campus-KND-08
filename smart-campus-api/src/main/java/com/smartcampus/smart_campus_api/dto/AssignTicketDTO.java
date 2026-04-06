package com.smartcampus.smart_campus_api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTicketDTO {

    @NotNull(message = "Assignee ID is required")
    private Long assigneeId;

    @NotNull(message = "Admin user ID is required")
    private Long adminUserId;
}