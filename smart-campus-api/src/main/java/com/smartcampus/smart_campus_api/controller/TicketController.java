package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.dto.*;
import com.smartcampus.smart_campus_api.model.TicketCategory;
import com.smartcampus.smart_campus_api.model.TicketPriority;
import com.smartcampus.smart_campus_api.model.TicketStatus;
import com.smartcampus.smart_campus_api.service.IncidentTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final IncidentTicketService ticketService;

    // =====================
    // TICKET ENDPOINTS
    // =====================

    // ENDPOINT 1 — POST create a new ticket
    // POST /api/v1/tickets
    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody CreateTicketDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(dto));
    }

    // ENDPOINT 2 — GET ticket by ID
    // GET /api/v1/tickets/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // ENDPOINT 3 — GET all tickets (admin)
    // GET /api/v1/tickets
    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) TicketPriority priority) {

        if (status != null) {
            return ResponseEntity.ok(ticketService.getTicketsByStatus(status));
        }
        if (category != null) {
            return ResponseEntity.ok(ticketService.getTicketsByCategory(category));
        }
        if (priority != null) {
            return ResponseEntity.ok(ticketService.getTicketsByPriority(priority));
        }
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // ENDPOINT 4 — GET my tickets (reporter)
    // GET /api/v1/tickets/my?userId=1
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(
            @RequestParam Long userId) {
        return ResponseEntity.ok(ticketService.getTicketsByReporter(userId));
    }

    // ENDPOINT 5 — GET tickets assigned to me (technician)
    // GET /api/v1/tickets/assigned?userId=1
    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponseDTO>> getAssignedTickets(
            @RequestParam Long userId) {
        return ResponseEntity.ok(ticketService.getTicketsByAssignee(userId));
    }

    // ENDPOINT 6 — PATCH update ticket status (technician/admin)
    // PATCH /api/v1/tickets/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusDTO dto) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, dto));
    }

    // ENDPOINT 7 — PUT assign technician (admin)
    // PUT /api/v1/tickets/{id}/assign
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketDTO dto) {
        return ResponseEntity.ok(ticketService.assignTicket(id, dto));
    }

    // =====================
    // ATTACHMENT ENDPOINTS
    // =====================

    // ENDPOINT 8 — POST upload image attachment (max 3)
    // POST /api/v1/tickets/{id}/attachments
    @PostMapping("/{id}/attachments")
    public ResponseEntity<TicketAttachmentResponseDTO> addAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addAttachment(id, file));
    }

    // ENDPOINT 9 — GET view/download image file
    // GET /api/v1/tickets/attachments/{attachmentId}/file
    @GetMapping("/attachments/{attachmentId}/file")
    public ResponseEntity<byte[]> getAttachmentFile(
            @PathVariable Long attachmentId) {
        byte[] fileData = ticketService.getAttachmentFile(attachmentId);
        String contentType = ticketService.getAttachmentContentType(attachmentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(fileData);
    }

    // ENDPOINT 10 — DELETE remove an attachment
    // DELETE /api/v1/tickets/attachments/{attachmentId}?userId=1
    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long attachmentId,
            @RequestParam Long userId) {
        ticketService.deleteAttachment(attachmentId, userId);
        return ResponseEntity.noContent().build();
    }

    // =====================
    // COMMENT ENDPOINTS
    // =====================

    // ENDPOINT 11 — POST add a comment
    // POST /api/v1/tickets/{id}/comments
    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentResponseDTO> addComment(
            @PathVariable Long id,
            @Valid @RequestBody TicketCommentDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, dto));
    }

    // ENDPOINT 12 — GET all comments for a ticket
    // GET /api/v1/tickets/{id}/comments
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentResponseDTO>> getComments(
            @PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getCommentsByTicket(id));
    }

    // ENDPOINT 13 — PUT edit a comment (author only)
    // PUT /api/v1/tickets/comments/{commentId}
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketCommentResponseDTO> editComment(
            @PathVariable Long commentId,
            @Valid @RequestBody TicketCommentDTO dto) {
        return ResponseEntity.ok(ticketService.editComment(commentId, dto));
    }

    // ENDPOINT 14 — DELETE remove a comment (author only)
    // DELETE /api/v1/tickets/comments/{commentId}?userId=1
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        ticketService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}