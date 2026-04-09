package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.model.ResourceStatus;
import com.smartcampus.smart_campus_api.model.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    // Member 2 will use this to check if resource exists and is ACTIVE
    Optional<Resource> findByResourceCode(String resourceCode);

    // Search by type
    List<Resource> findByType(ResourceType type);

    // Search by status
    List<Resource> findByStatus(ResourceStatus status);

    // Search by type and status
    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);

    // Filter by capacity (greater than or equal)
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    // Search by location containing keyword
    List<Resource> findByLocationContainingIgnoreCase(String location);

    // Combined filter query
    @Query("SELECT r FROM Resource r WHERE " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minCapacity IS NULL OR r.capacity >= :minCapacity)")
    List<Resource> filterResources(
            @Param("type") ResourceType type,
            @Param("status") ResourceStatus status,
            @Param("location") String location,
            @Param("minCapacity") Integer minCapacity
    );
}