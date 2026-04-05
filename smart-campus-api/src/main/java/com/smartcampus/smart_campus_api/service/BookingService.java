package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.AdminReviewRequest;
import com.smartcampus.smart_campus_api.dto.BookingRequest;
import com.smartcampus.smart_campus_api.dto.BookingResponse;
import com.smartcampus.smart_campus_api.dto.CreateNotificationDTO;
import com.smartcampus.smart_campus_api.exception.BookingConflictException;
import com.smartcampus.smart_campus_api.exception.ResourceNotFoundException;
import com.smartcampus.smart_campus_api.model.Booking;
import com.smartcampus.smart_campus_api.model.BookingStatus;
import com.smartcampus.smart_campus_api.model.NotificationType;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.repository.BookingRepository;
import com.smartcampus.smart_campus_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // ===================== CREATE BOOKING =====================
    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long userId) {

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // CONFLICT CHECK
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getResourceId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            throw new BookingConflictException(
                "This resource is already booked from " +
                conflict.getStartTime() + " to " + conflict.getEndTime() +
                " on " + conflict.getBookingDate()
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Booking booking = Booking.builder()
                .user(user)
                .resourceId(request.getResourceId())
                .resourceName(request.getResourceName())
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);

        // When booking is created → use SYSTEM type
        // (there's no BOOKING_PENDING in the enum, SYSTEM is the best fit)
        notificationService.createNotification(
            CreateNotificationDTO.builder()
                .recipientUserId(userId)
                .title("Booking Request Submitted")
                .message("Your booking for " + request.getResourceName() +
                         " on " + request.getBookingDate() +
                         " from " + request.getStartTime() +
                         " to " + request.getEndTime() + " is pending approval.")
                .type(NotificationType.SYSTEM)
                .referenceId("BOOKING-" + saved.getId())
                .build()
        );

        return toResponse(saved);
    }

    // ===================== GET MY BOOKINGS =====================
    public List<BookingResponse> getMyBookings(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===================== GET ALL BOOKINGS (ADMIN) =====================
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===================== GET BOOKINGS BY STATUS =====================
    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===================== GET ONE BOOKING =====================
    public BookingResponse getBookingById(Long bookingId) {
        return toResponse(findBookingOrThrow(bookingId));
    }

    // ===================== ADMIN: APPROVE OR REJECT =====================
    @Transactional
    public BookingResponse reviewBooking(Long bookingId, AdminReviewRequest request, Long adminId) {
        Booking booking = findBookingOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException(
                "Cannot review a booking that is already " + booking.getStatus()
            );
        }

        if (request.getApproved()) {
            // Fresh conflict check before approving
            List<Booking> conflicts = bookingRepository.findConflictingBookingsExcluding(
                    booking.getResourceId(),
                    booking.getBookingDate(),
                    booking.getStartTime(),
                    booking.getEndTime(),
                    bookingId
            );
            if (!conflicts.isEmpty()) {
                throw new BookingConflictException(
                    "Cannot approve: a conflicting booking already exists for this time slot."
                );
            }
            booking.setStatus(BookingStatus.APPROVED);
        } else {
            booking.setStatus(BookingStatus.REJECTED);
        }

        booking.setAdminRemarks(request.getRemarks());
        booking.setReviewedBy(adminId);
        booking.setReviewedAt(LocalDateTime.now());
        Booking updated = bookingRepository.save(booking);

        // Use BOOKING_APPROVED or BOOKING_REJECTED — exact match to the enum
        NotificationType notifType = request.getApproved()
                ? NotificationType.BOOKING_APPROVED
                : NotificationType.BOOKING_REJECTED;

        String title = request.getApproved() ? "Booking Approved" : "Booking Rejected";
        String message = request.getApproved()
            ? "Your booking for " + booking.getResourceName() +
              " on " + booking.getBookingDate() + " has been APPROVED."
            : "Your booking for " + booking.getResourceName() +
              " on " + booking.getBookingDate() + " has been REJECTED." +
              (request.getRemarks() != null ? " Reason: " + request.getRemarks() : "");

        notificationService.createNotification(
            CreateNotificationDTO.builder()
                .recipientUserId(booking.getUser().getId())
                .title(title)
                .message(message)
                .type(notifType)
                .referenceId("BOOKING-" + bookingId)
                .build()
        );

        return toResponse(updated);
    }

    // ===================== CANCEL BOOKING =====================
    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId) {
        Booking booking = findBookingOrThrow(bookingId);

        if (!booking.getUser().getId().equals(userId)) {
            throw new SecurityException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED ||
            booking.getStatus() == BookingStatus.REJECTED) {
            throw new IllegalStateException("Booking is already " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);

        // No BOOKING_CANCELLED in the enum, SYSTEM is the best fit
        notificationService.createNotification(
            CreateNotificationDTO.builder()
                .recipientUserId(userId)
                .title("Booking Cancelled")
                .message("Your booking for " + booking.getResourceName() +
                         " on " + booking.getBookingDate() + " has been cancelled.")
                .type(NotificationType.SYSTEM)
                .referenceId("BOOKING-" + booking.getId())
                .build()
        );

        return toResponse(updated);
    }

    // ===================== CHECK AVAILABILITY =====================
    public List<BookingResponse> getAvailabilityForResource(Long resourceId, LocalDate date) {
        return bookingRepository.findByResourceIdAndBookingDate(resourceId, date)
                .stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED ||
                             b.getStatus() == BookingStatus.PENDING)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ===================== HELPERS =====================

    private Booking findBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
    }

    private BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .userEmail(booking.getUser().getEmail())
                .resourceId(booking.getResourceId())
                .resourceName(booking.getResourceName())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .adminRemarks(booking.getAdminRemarks())
                .createdAt(booking.getCreatedAt())
                .reviewedAt(booking.getReviewedAt())
                .build();
    }
}