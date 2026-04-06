package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.TicketCategory;
import com.smartcampus.smart_campus_api.model.TicketPriority;
import com.smartcampus.smart_campus_api.model.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String location;
    private TicketCategory category;
    private TicketPriority priority;
    private TicketStatus status;
    private String contactDetails;
    private String resolutionNote;
    private String rejectionReason;
    private Long reporterId;
    private String reporterName;
    private Long assigneeId;
    private String assigneeName;
    private List<TicketAttachmentResponseDTO> attachments;
    private List<TicketCommentResponseDTO> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}