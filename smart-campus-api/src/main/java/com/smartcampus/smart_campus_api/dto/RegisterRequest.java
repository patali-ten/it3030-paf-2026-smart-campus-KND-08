package com.smartcampus.smart_campus_api.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 3, message = "Password must be at least 3 characters")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[@_$#!%^&*])[A-Za-z0-9@_$#!%^&*]+$",
        message = "Password must contain at least one number and one special character (@, _, $, #, !, %, ^, &, *)"
    )
    private String password;
}