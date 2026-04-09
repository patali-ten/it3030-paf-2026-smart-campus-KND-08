package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.ResourceStatus;
import com.smartcampus.smart_campus_api.model.ResourceType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalTime;

// This is what Admin sends when CREATING or UPDATING a resource
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceRequestDTO {

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotBlank(message = "Resource code is required")
    private String resourceCode;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String location;

    private String description;

    private ResourceStatus status;

    private LocalTime availabilityStart;

    private LocalTime availabilityEnd;
}