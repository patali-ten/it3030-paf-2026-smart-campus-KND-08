package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.dto.ResourceRequestDTO;
import com.smartcampus.smart_campus_api.dto.ResourceResponseDTO;
import com.smartcampus.smart_campus_api.model.ResourceStatus;
import com.smartcampus.smart_campus_api.model.ResourceType;
import com.smartcampus.smart_campus_api.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
// ⚠️ CHANGE THIS: Replace with your actual frontend URL when connecting
@CrossOrigin(origins = "http://localhost:5173") //3000
public class ResourceController {

    private final ResourceService resourceService;

    /**
     * GET /api/resources
     * Get all resources with optional filters
     * Accessible by: ALL logged-in users
     */
    @GetMapping
    public ResponseEntity<List<ResourceResponseDTO>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {

        return ResponseEntity.ok(
                resourceService.getAllResources(type, status, location, minCapacity)
        );
    }

    /**
     * GET /api/resources/{id}
     * Get single resource by ID
     * Accessible by: ALL logged-in users
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    /**
     * GET /api/resources/code/{code}
     * Get resource by resource code (e.g., LH-101)
     * Used by: Member 2 (Booking), Member 3 (Tickets)
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<ResourceResponseDTO> getResourceByCode(@PathVariable String code) {
        return ResponseEntity.ok(resourceService.getResourceByCode(code));
    }

    /**
     * POST /api/resources
     * Create a new resource
     * Accessible by: ADMIN only
     * ⚠️ CONNECT WITH MEMBER 4: They must set up the ADMIN role in Spring Security
     */
    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')")  // ⚠️ Uncomment this AFTER Member 4 sets up security
    public ResponseEntity<ResourceResponseDTO> createResource(
            @Valid @RequestBody ResourceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceService.createResource(dto));
    }

    /**
     * PUT /api/resources/{id}
     * Update an existing resource
     * Accessible by: ADMIN only
     * ⚠️ CONNECT WITH MEMBER 4: They must set up the ADMIN role in Spring Security
     */
    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")  // ⚠️ Uncomment this AFTER Member 4 sets up security
    public ResponseEntity<ResourceResponseDTO> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequestDTO dto) {
        return ResponseEntity.ok(resourceService.updateResource(id, dto));
    }

    /**
     * DELETE /api/resources/{id}
     * Delete a resource
     * Accessible by: ADMIN only
     * ⚠️ CONNECT WITH MEMBER 4: They must set up the ADMIN role in Spring Security
     */
    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")  // ⚠️ Uncomment this AFTER Member 4 sets up security
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}