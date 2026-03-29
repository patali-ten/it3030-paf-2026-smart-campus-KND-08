package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    private Long id;
    private String email;
    private String name;
    private String profilePicture;
    private Set<Role> roles;
    private boolean enabled;
}