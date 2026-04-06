package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {

    // Get all attachments for a ticket
    List<TicketAttachment> findByTicketId(Long ticketId);

    // Count attachments for a ticket (max 3 allowed)
    long countByTicketId(Long ticketId);
}