package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.IncidentTicket;
import com.smartcampus.smart_campus_api.model.TicketCategory;
import com.smartcampus.smart_campus_api.model.TicketPriority;
import com.smartcampus.smart_campus_api.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {

    // Get all tickets reported by a specific user
    List<IncidentTicket> findByReporterIdOrderByCreatedAtDesc(Long reporterId);

    // Get all tickets assigned to a technician
    List<IncidentTicket> findByAssigneeIdOrderByCreatedAtDesc(Long assigneeId);

    // Filter tickets by status
    List<IncidentTicket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    // Filter tickets by category
    List<IncidentTicket> findByCategoryOrderByCreatedAtDesc(TicketCategory category);

    // Filter tickets by priority
    List<IncidentTicket> findByPriorityOrderByCreatedAtDesc(TicketPriority priority);

    // Get all tickets newest first (admin use)
    List<IncidentTicket> findAllByOrderByCreatedAtDesc();
}