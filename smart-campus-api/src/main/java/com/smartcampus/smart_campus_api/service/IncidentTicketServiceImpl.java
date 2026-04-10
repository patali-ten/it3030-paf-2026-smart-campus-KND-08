package com.smartcampus.smart_campus_api.service;
 
import com.smartcampus.smart_campus_api.dto.*;
import com.smartcampus.smart_campus_api.exception.ResourceNotFoundException;
import com.smartcampus.smart_campus_api.model.*;
import com.smartcampus.smart_campus_api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
@Transactional
public class IncidentTicketServiceImpl implements IncidentTicketService {
 
    private final IncidentTicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
 
    @Value("${app.upload.dir:uploads/tickets}")
    private String uploadDir;

    @Override
    public TicketResponseDTO createTicket(CreateTicketDTO dto) {
        User reporter = findUserOrThrow(dto.getReporterId());
        IncidentTicket ticket = IncidentTicket.builder()
                .reporter(reporter)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .category(dto.getCategory())
                .priority(dto.getPriority())
                .contactDetails(dto.getContactDetails())
                .status(TicketStatus.OPEN)
                .build();
        return mapToResponseDTO(ticketRepository.save(ticket));
    }
 
    @Override
    @Transactional(readOnly = true)
    public TicketResponseDTO getTicketById(Long ticketId) {
        return mapToResponseDTO(findTicketOrThrow(ticketId));
    }
 
    @Override
    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getTicketsByReporter(Long reporterId) {
        return ticketRepository.findByReporterIdOrderByCreatedAtDesc(reporterId)
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getTicketsByAssignee(Long assigneeId) {
        return ticketRepository.findByAssigneeIdOrderByCreatedAtDesc(assigneeId)
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getTicketsByCategory(TicketCategory category) {
        return ticketRepository.findByCategoryOrderByCreatedAtDesc(category)
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getTicketsByPriority(TicketPriority priority) {
        return ticketRepository.findByPriorityOrderByCreatedAtDesc(priority)
                .stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }
 
    @Override
    public TicketResponseDTO updateTicketStatus(Long ticketId, UpdateTicketStatusDTO dto) {
        IncidentTicket ticket = findTicketOrThrow(ticketId);
        if (dto.getStatus() == TicketStatus.REJECTED &&
                (dto.getRejectionReason() == null || dto.getRejectionReason().isBlank())) {
            throw new RuntimeException("Rejection reason is required");
        }
        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(dto.getStatus());
        if (dto.getResolutionNote() != null) ticket.setResolutionNote(dto.getResolutionNote());
        if (dto.getRejectionReason() != null) ticket.setRejectionReason(dto.getRejectionReason());
        IncidentTicket updated = ticketRepository.save(ticket);

        if (!oldStatus.equals(dto.getStatus())) {
            // Notify the Reporter
            notificationService.createNotification(CreateNotificationDTO.builder()
                    .recipientUserId(ticket.getReporter().getId())
                    .title("Ticket Status Updated")
                    .message("Your ticket \"" + ticket.getTitle() + "\" status changed to " + dto.getStatus())
                    .type(NotificationType.TICKET_STATUS_CHANGED)
                    .referenceId(String.valueOf(ticketId))
                    .build());

            // Notify ONLY the Admin who assigned this ticket
            if (ticket.getAssignedBy() != null) {
                notificationService.createNotification(CreateNotificationDTO.builder()
                        .recipientUserId(ticket.getAssignedBy().getId())
                        .title("Assigned Ticket Updated")
                        .message("Technician updated Ticket #" + ticketId + " (\"" + ticket.getTitle() + "\") to " + dto.getStatus())
                        .type(NotificationType.TICKET_STATUS_CHANGED)
                        .referenceId(String.valueOf(ticketId))
                        .build());
            }
        }
        return mapToResponseDTO(updated);
    }
 
    @Override
    public TicketResponseDTO assignTicket(Long ticketId, AssignTicketDTO dto) {
        IncidentTicket ticket = findTicketOrThrow(ticketId);
        User assignee = findUserOrThrow(dto.getAssigneeId());
        User admin = findUserOrThrow(dto.getAdminUserId()); // Using adminUserId from DTO
        
        ticket.setAssignee(assignee);
        ticket.setAssignedBy(admin); // Set the specific admin
        
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        IncidentTicket updated = ticketRepository.save(ticket);

        // Notify Reporter
        notificationService.createNotification(CreateNotificationDTO.builder()
                .recipientUserId(ticket.getReporter().getId())
                .title("Technician Assigned")
                .message("A technician has been assigned to your ticket \"" + ticket.getTitle() + "\"")
                .type(NotificationType.TICKET_STATUS_CHANGED)
                .referenceId(String.valueOf(ticketId))
                .build());

        // Notify Technician
        notificationService.createNotification(CreateNotificationDTO.builder()
                .recipientUserId(assignee.getId())
                .title("New Ticket Assigned")
                .message("You have been assigned to a new ticket: \"" + ticket.getTitle() + "\"")
                .type(NotificationType.TICKET_STATUS_CHANGED)
                .referenceId(String.valueOf(ticketId))
                .build());

        return mapToResponseDTO(updated);
    }

    @Override
    public void deleteTicket(Long ticketId, Long requestingUserId) {
        IncidentTicket ticket = findTicketOrThrow(ticketId);
        User requestingUser = findUserOrThrow(requestingUserId);

        boolean isAdmin = requestingUser.getRoles().contains(Role.ADMIN);
        boolean isReporter = ticket.getReporter().getId().equals(requestingUserId);

        if (!isAdmin && !isReporter) {
            throw new RuntimeException("Not authorized to delete this ticket");
        }

        if (isReporter && !isAdmin && ticket.getStatus() != TicketStatus.OPEN) {
            throw new RuntimeException("Only OPEN tickets can be deleted");
        }

        for (TicketAttachment attachment : ticket.getAttachments()) {
            try {
                Files.deleteIfExists(Paths.get(attachment.getFilePath()));
            } catch (IOException e) {
                // log but continue
            }
        }

        ticketRepository.delete(ticket);
    }
 
    @Override
    public TicketAttachmentResponseDTO addAttachment(Long ticketId, MultipartFile file) {
        IncidentTicket ticket = findTicketOrThrow(ticketId);
        if (attachmentRepository.countByTicketId(ticketId) >= 3) {
            throw new RuntimeException("Maximum 3 attachments allowed per ticket");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment";
        String extension = originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String storedName = UUID.randomUUID() + extension;
        Path ticketDir = Paths.get(uploadDir, String.valueOf(ticketId));
        try {
            Files.createDirectories(ticketDir);
            Path targetPath = ticketDir.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            TicketAttachment attachment = TicketAttachment.builder()
                    .ticket(ticket)
                    .fileName(originalFilename)
                    .filePath(targetPath.toString())
                    .contentType(contentType)
                    .build();
            return mapToAttachmentDTO(attachmentRepository.save(attachment));
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
    }
 
    @Override
    public void deleteAttachment(Long attachmentId, Long requestingUserId) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId));
        if (!attachment.getTicket().getReporter().getId().equals(requestingUserId)) {
            throw new RuntimeException("Not authorized to delete this attachment");
        }
        try {
            Files.deleteIfExists(Paths.get(attachment.getFilePath()));
        } catch (IOException e) {
            // log but continue
        }
        attachmentRepository.delete(attachment);
    }
 
    @Override
    @Transactional(readOnly = true)
    public byte[] getAttachmentFile(Long attachmentId) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId));
        try {
            return Files.readAllBytes(Paths.get(attachment.getFilePath()));
        } catch (IOException e) {
            throw new RuntimeException("Could not read file: " + e.getMessage());
        }
    }
 
    @Override
    @Transactional(readOnly = true)
    public String getAttachmentContentType(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId))
                .getContentType();
    }
 
    @Override
    public TicketCommentResponseDTO addComment(Long ticketId, TicketCommentDTO dto) {
        IncidentTicket ticket = findTicketOrThrow(ticketId);
        User author = findUserOrThrow(dto.getAuthorId());
        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(author)
                .content(dto.getContent())
                .build();
        TicketComment saved = commentRepository.save(comment);
        if (!author.getId().equals(ticket.getReporter().getId())) {
            notificationService.createNotification(CreateNotificationDTO.builder()
                    .recipientUserId(ticket.getReporter().getId())
                    .title("New Comment on Your Ticket")
                    .message(author.getName() + " commented on your ticket \"" + ticket.getTitle() + "\"")
                    .type(NotificationType.NEW_COMMENT)
                    .referenceId(String.valueOf(ticketId))
                    .build());
        }
        return mapToCommentDTO(saved);
    }
 
    @Override
    public TicketCommentResponseDTO editComment(Long commentId, TicketCommentDTO dto) {
        TicketComment comment = findCommentOrThrow(commentId);
        if (!comment.getAuthor().getId().equals(dto.getAuthorId())) {
            throw new RuntimeException("Not authorized to edit this comment");
        }
        comment.setContent(dto.getContent());
        return mapToCommentDTO(commentRepository.save(comment));
    }
 
    @Override
    public void deleteComment(Long commentId, Long requestingUserId) {
        TicketComment comment = findCommentOrThrow(commentId);
        if (!comment.getAuthor().getId().equals(requestingUserId)) {
            throw new RuntimeException("Not authorized to delete this comment");
        }
        commentRepository.delete(comment);
    }
 
    @Override
    @Transactional(readOnly = true)
    public List<TicketCommentResponseDTO> getCommentsByTicket(Long ticketId) {
        findTicketOrThrow(ticketId);
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(this::mapToCommentDTO).collect(Collectors.toList());
    }
 
    private IncidentTicket findTicketOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }
 
    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
 
    private TicketComment findCommentOrThrow(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + id));
    }
 
    private TicketResponseDTO mapToResponseDTO(IncidentTicket ticket) {
        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .location(ticket.getLocation())
                .category(ticket.getCategory())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .contactDetails(ticket.getContactDetails())
                .resolutionNote(ticket.getResolutionNote())
                .rejectionReason(ticket.getRejectionReason())
                .reporterId(ticket.getReporter().getId())
                .reporterName(ticket.getReporter().getName())
                .assigneeId(ticket.getAssignee() != null ? ticket.getAssignee().getId() : null)
                .assigneeName(ticket.getAssignee() != null ? ticket.getAssignee().getName() : null)
                .attachments(ticket.getAttachments().stream().map(this::mapToAttachmentDTO).collect(Collectors.toList()))
                .comments(ticket.getComments().stream().map(this::mapToCommentDTO).collect(Collectors.toList()))
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
 
    private TicketAttachmentResponseDTO mapToAttachmentDTO(TicketAttachment a) {
        return TicketAttachmentResponseDTO.builder()
                .id(a.getId())
                .fileName(a.getFileName())
                .fileUrl("http://localhost:8080/api/v1/tickets/attachments/" + a.getId() + "/file")
                .contentType(a.getContentType())
                .uploadedAt(a.getUploadedAt())
                .build();
    }
 
    private TicketCommentResponseDTO mapToCommentDTO(TicketComment c) {
        return TicketCommentResponseDTO.builder()
                .id(c.getId())
                .ticketId(c.getTicket().getId())
                .authorId(c.getAuthor().getId())
                .authorName(c.getAuthor().getName())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}