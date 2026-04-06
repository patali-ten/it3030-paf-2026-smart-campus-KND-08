package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.CreateNotificationDTO;
import com.smartcampus.smart_campus_api.dto.NotificationResponseDTO;
import com.smartcampus.smart_campus_api.exception.ResourceNotFoundException;
import com.smartcampus.smart_campus_api.model.Notification;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.repository.NotificationRepository;
import com.smartcampus.smart_campus_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public NotificationResponseDTO createNotification(CreateNotificationDTO dto) {
        User user = userRepository.findById(dto.getRecipientUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getRecipientUserId()));

        Notification notification = Notification.builder()
                .recipient(user)
                .title(dto.getTitle())
                .message(dto.getMessage())
                .type(dto.getType())
                .referenceId(dto.getReferenceId())
                .read(false)
                .build();

        return toDTO(notificationRepository.save(notification));
    }

    @Override
    public List<NotificationResponseDTO> getAllNotifications(Long userId) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponseDTO> getUnreadNotifications(Long userId) {
        return notificationRepository
                .findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Override
    public NotificationResponseDTO markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("You can only mark your own notifications as read");
        }

        notification.setRead(true);
        return toDTO(notificationRepository.save(notification));
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository
                .findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own notifications");
        }

        notificationRepository.delete(notification);
    }

    // Helper: Entity → DTO
    private NotificationResponseDTO toDTO(Notification n) {
        return NotificationResponseDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .referenceId(n.getReferenceId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}