package com.smartcampus.smart_campus_api.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

// DTO = Data Transfer Object
// This is the shape of the JSON body the user sends when creating a booking
// Example JSON:
// {
//   "resourceId": 1,
//   "resourceName": "Lecture Hall 101",
//   "bookingDate": "2026-04-10",
//   "startTime": "09:00",
//   "endTime": "11:00",
//   "purpose": "CS Lecture",
//   "expectedAttendees": 30
// }
@Data
public class BookingRequest {

    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    @NotBlank(message = "Resource name is required")
    private String resourceName;

    @NotNull(message = "Booking date is required")
    @FutureOrPresent(message = "Booking date cannot be in the past")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotBlank(message = "Purpose is required")
    @Size(min = 3, max = 255, message = "Purpose must be between 3 and 255 characters")
    private String purpose;

    // Optional - not required for equipment like projectors
    @Min(value = 1, message = "Expected attendees must be at least 1")
    private Integer expectedAttendees;
}