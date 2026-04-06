package com.smartcampus.smart_campus_api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketAttachmentResponseDTO {
    private Long id;
    private String fileName;
    private String fileUrl;
    private String contentType;
    private LocalDateTime uploadedAt;
}