package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.dto.AdminReviewRequest;
import com.smartcampus.smart_campus_api.dto.BookingRequest;
import com.smartcampus.smart_campus_api.dto.BookingResponse;
import com.smartcampus.smart_campus_api.model.BookingStatus;
import com.smartcampus.smart_campus_api.repository.UserRepository;
import com.smartcampus.smart_campus_api.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    // =====================================================================
    // POST /api/bookings
    // Create a new booking
    // =====================================================================
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            Principal principal) {

        Long userId = getUserIdFromPrincipal(principal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request, userId));
    }

    // =====================================================================
    // GET /api/bookings/my
    // Get current user's bookings
    // =====================================================================
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    // =====================================================================
    // GET /api/bookings/availability
    // IMPORTANT: must be before /{id} so Spring doesn't confuse
    // "availability" as an ID
    // =====================================================================
    @GetMapping("/availability")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponse>> checkAvailability(
            @RequestParam Long resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(
                bookingService.getAvailabilityForResource(resourceId, date));
    }

    // =====================================================================
    // GET /api/bookings/{id}
    // Get one booking by ID
    // =====================================================================
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // =====================================================================
    // GET /api/bookings
    // Admin: get all bookings with optional status filter
    // =====================================================================
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {

        if (status != null) {
            return ResponseEntity.ok(bookingService.getBookingsByStatus(status));
        }
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // =====================================================================
    // PUT /api/bookings/{id}/review
    // Admin: approve or reject a booking
    // =====================================================================
    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> reviewBooking(
            @PathVariable Long id,
            @Valid @RequestBody AdminReviewRequest request,
            Principal principal) {

        Long adminId = getUserIdFromPrincipal(principal);
        return ResponseEntity.ok(bookingService.reviewBooking(id, request, adminId));
    }

    // =====================================================================
    // DELETE /api/bookings/{id}/cancel
    // User cancels their own PENDING or APPROVED booking
    // =====================================================================
    @DeleteMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            Principal principal) {

        Long userId = getUserIdFromPrincipal(principal);
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
    }

    // =====================================================================
    // DELETE /api/bookings/{id}
    // User deletes their own REJECTED or CANCELLED booking permanently
    // =====================================================================
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteBooking(
            @PathVariable Long id,
            Principal principal) {

        Long userId = getUserIdFromPrincipal(principal);
        bookingService.deleteBooking(id, userId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // =====================================================================
    // DELETE /api/bookings/{id}/admin
    // Admin deletes any booking permanently
    // =====================================================================
    @DeleteMapping("/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> adminDeleteBooking(@PathVariable Long id) {
        bookingService.adminDeleteBooking(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // =====================================================================
    // HELPER - get user ID from the logged-in user's email
    // =====================================================================
    private Long getUserIdFromPrincipal(Principal principal) {
        String email = principal.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email))
                .getId();
    }
}