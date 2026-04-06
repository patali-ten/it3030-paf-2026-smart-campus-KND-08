package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.BookingStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

// This is what we send BACK to the user/admin when they ask about a booking
// We don't expose the full User object - just basic info for safety
@Data
@Builder
public class BookingResponse {
    private Long id;
    private Long userId;
    private String userName;       // user's name for display
    private String userEmail;      // user's email for display
    private Long resourceId;
    private String resourceName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String adminRemarks;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}