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

    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestBody CreateTicketDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketCategory category,
            @RequestParam(required = false) TicketPriority priority) {
        if (status != null) return ResponseEntity.ok(ticketService.getTicketsByStatus(status));
        if (category != null) return ResponseEntity.ok(ticketService.getTicketsByCategory(category));
        if (priority != null) return ResponseEntity.ok(ticketService.getTicketsByPriority(priority));
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(
            @RequestParam Long userId) {
        return ResponseEntity.ok(ticketService.getTicketsByReporter(userId));
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponseDTO>> getAssignedTickets(
            @RequestParam Long userId) {
        return ResponseEntity.ok(ticketService.getTicketsByAssignee(userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusDTO dto) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, dto));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketDTO dto) {
        return ResponseEntity.ok(ticketService.assignTicket(id, dto));
    }

    // ENDPOINT 8 — DELETE ticket by reporter (only if OPEN)
    // DELETE /api/v1/tickets/{id}?userId=1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id,
            @RequestParam Long userId) {
        ticketService.deleteTicket(id, userId);
        return ResponseEntity.noContent().build();
    }

    // =====================
    // ATTACHMENT ENDPOINTS
    // =====================

    @PostMapping("/{id}/attachments")
    public ResponseEntity<TicketAttachmentResponseDTO> addAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addAttachment(id, file));
    }

    @GetMapping("/attachments/{attachmentId}/file")
    public ResponseEntity<byte[]> getAttachmentFile(
            @PathVariable Long attachmentId) {
        byte[] fileData = ticketService.getAttachmentFile(attachmentId);
        String contentType = ticketService.getAttachmentContentType(attachmentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(fileData);
    }

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

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketCommentResponseDTO> addComment(
            @PathVariable Long id,
            @Valid @RequestBody TicketCommentDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, dto));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketCommentResponseDTO>> getComments(
            @PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getCommentsByTicket(id));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<TicketCommentResponseDTO> editComment(
            @PathVariable Long commentId,
            @Valid @RequestBody TicketCommentDTO dto) {
        return ResponseEntity.ok(ticketService.editComment(commentId, dto));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        ticketService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}