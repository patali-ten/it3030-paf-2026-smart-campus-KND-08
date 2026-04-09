package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.ResourceRequestDTO;
import com.smartcampus.smart_campus_api.dto.ResourceResponseDTO;
import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.model.ResourceStatus;
import com.smartcampus.smart_campus_api.model.ResourceType;
import com.smartcampus.smart_campus_api.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // ── GET ALL (with optional filters) ──────────────────────────────
    public List<ResourceResponseDTO> getAllResources(
            ResourceType type,
            ResourceStatus status,
            String location,
            Integer minCapacity) {

        return resourceRepository
                .filterResources(type, status, location, minCapacity)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // ── GET BY ID ─────────────────────────────────────────────────────
    public ResourceResponseDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        return toResponseDTO(resource);
    }

    // ── GET BY CODE (Member 2 uses this) ─────────────────────────────
    public ResourceResponseDTO getResourceByCode(String code) {
        Resource resource = resourceRepository.findByResourceCode(code)
                .orElseThrow(() -> new RuntimeException("Resource not found with code: " + code));
        return toResponseDTO(resource);
    }

    // ── CREATE (Admin only) ───────────────────────────────────────────
    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {
        Resource resource = Resource.builder()
                .name(dto.getName())
                .resourceCode(dto.getResourceCode())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : ResourceStatus.ACTIVE)
                .availabilityStart(dto.getAvailabilityStart())
                .availabilityEnd(dto.getAvailabilityEnd())
                .build();

        return toResponseDTO(resourceRepository.save(resource));
    }

    // ── UPDATE (Admin only) ───────────────────────────────────────────
    public ResourceResponseDTO updateResource(Long id, ResourceRequestDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));

        // Only update fields that are sent
        if (dto.getName() != null) resource.setName(dto.getName());
        if (dto.getResourceCode() != null) resource.setResourceCode(dto.getResourceCode());
        if (dto.getType() != null) resource.setType(dto.getType());
        if (dto.getCapacity() != null) resource.setCapacity(dto.getCapacity());
        if (dto.getLocation() != null) resource.setLocation(dto.getLocation());
        if (dto.getDescription() != null) resource.setDescription(dto.getDescription());
        if (dto.getStatus() != null) resource.setStatus(dto.getStatus());
        if (dto.getAvailabilityStart() != null) resource.setAvailabilityStart(dto.getAvailabilityStart());
        if (dto.getAvailabilityEnd() != null) resource.setAvailabilityEnd(dto.getAvailabilityEnd());

        return toResponseDTO(resourceRepository.save(resource));
    }

    // ── DELETE (Admin only) ───────────────────────────────────────────
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    // ── HELPER: Entity → DTO ──────────────────────────────────────────
    private ResourceResponseDTO toResponseDTO(Resource resource) {
        return ResourceResponseDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .resourceCode(resource.getResourceCode())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .description(resource.getDescription())
                .status(resource.getStatus())
                .availabilityStart(resource.getAvailabilityStart())
                .availabilityEnd(resource.getAvailabilityEnd())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}