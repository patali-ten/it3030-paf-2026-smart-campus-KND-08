package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    // Get all comments for a ticket, oldest first
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}