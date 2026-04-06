package com.smartcampus.smart_campus_api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

// Admin sends this when they approve or reject a booking
// Example JSON:
// { "approved": true, "remarks": "Approved for use" }
// OR
// { "approved": false, "remarks": "Room already in use for exam" }
@Data
public class AdminReviewRequest {

    @NotNull(message = "Decision (approved true/false) is required")
    private Boolean approved;

    // Optional message from admin
    private String remarks;
}