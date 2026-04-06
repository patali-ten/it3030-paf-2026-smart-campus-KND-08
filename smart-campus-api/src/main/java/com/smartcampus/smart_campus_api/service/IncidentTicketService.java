package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.*;
import com.smartcampus.smart_campus_api.model.TicketCategory;
import com.smartcampus.smart_campus_api.model.TicketPriority;
import com.smartcampus.smart_campus_api.model.TicketStatus;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface IncidentTicketService {

    // Ticket operations
    TicketResponseDTO createTicket(CreateTicketDTO dto);
    TicketResponseDTO getTicketById(Long ticketId);
    List<TicketResponseDTO> getAllTickets();
    List<TicketResponseDTO> getTicketsByReporter(Long reporterId);
    List<TicketResponseDTO> getTicketsByAssignee(Long assigneeId);
    List<TicketResponseDTO> getTicketsByStatus(TicketStatus status);
    List<TicketResponseDTO> getTicketsByCategory(TicketCategory category);
    List<TicketResponseDTO> getTicketsByPriority(TicketPriority priority);

    // Status and assignment
    TicketResponseDTO updateTicketStatus(Long ticketId, UpdateTicketStatusDTO dto);
    TicketResponseDTO assignTicket(Long ticketId, AssignTicketDTO dto);

    // Attachments
    TicketAttachmentResponseDTO addAttachment(Long ticketId, MultipartFile file);
    void deleteAttachment(Long attachmentId, Long requestingUserId);
    byte[] getAttachmentFile(Long attachmentId);
    String getAttachmentContentType(Long attachmentId);

    // Comments
    TicketCommentResponseDTO addComment(Long ticketId, TicketCommentDTO dto);
    TicketCommentResponseDTO editComment(Long commentId, TicketCommentDTO dto);
    void deleteComment(Long commentId, Long requestingUserId);
    List<TicketCommentResponseDTO> getCommentsByTicket(Long ticketId);
}