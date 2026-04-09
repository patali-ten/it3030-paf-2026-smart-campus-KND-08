package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.ResourceStatus;
import com.smartcampus.smart_campus_api.model.ResourceType;
import lombok.*;

import java.time.LocalTime;
import java.time.LocalDateTime;

// This is what we SEND BACK to frontend
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceResponseDTO {

    private Long id;
    private String name;
    private String resourceCode;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String description;
    private ResourceStatus status;
    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}