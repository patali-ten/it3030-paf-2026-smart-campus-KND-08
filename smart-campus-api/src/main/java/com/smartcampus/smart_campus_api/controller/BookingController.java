package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.dto.AdminReviewRequest;
import com.smartcampus.smart_campus_api.dto.BookingRequest;
import com.smartcampus.smart_campus_api.dto.BookingResponse;
import com.smartcampus.smart_campus_api.model.BookingStatus;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

// @RestController = this class handles HTTP requests and returns JSON
// @RequestMapping = all endpoints here start with /api/bookings
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allows React frontend to call this API
public class BookingController {

    private final BookingService bookingService;

    // =====================================================================
    // POST /api/bookings
    // Create a new booking request
    // Who can use: any logged-in user (USER or ADMIN)
    // Body: BookingRequest JSON
    // Returns: 201 Created + the new booking
    // =====================================================================
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal User currentUser) {

        BookingResponse response = bookingService.createBooking(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =====================================================================
    // GET /api/bookings/my
    // Get the currently logged-in user's bookings
    // Who can use: any logged-in user
    // Returns: 200 OK + list of their bookings
    // =====================================================================
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(bookingService.getMyBookings(currentUser.getId()));
    }

    // =====================================================================
    // GET /api/bookings/{id}
    // Get one specific booking by ID
    // Who can use: any logged-in user
    // Returns: 200 OK + booking details
    // =====================================================================
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // =====================================================================
    // GET /api/bookings
    // Get ALL bookings (admin only)
    // Query param: ?status=PENDING (optional filter)
    // Who can use: ADMIN only
    // Returns: 200 OK + list of all bookings
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
    // Admin approves or rejects a booking
    // Who can use: ADMIN only
    // Body: { "approved": true/false, "remarks": "..." }
    // Returns: 200 OK + updated booking
    // =====================================================================
    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> reviewBooking(
            @PathVariable Long id,
            @Valid @RequestBody AdminReviewRequest request,
            @AuthenticationPrincipal User adminUser) {

        return ResponseEntity.ok(bookingService.reviewBooking(id, request, adminUser.getId()));
    }

    // =====================================================================
    // DELETE /api/bookings/{id}/cancel
    // User cancels their own booking
    // Who can use: the booking owner (any logged-in user)
    // Returns: 200 OK + cancelled booking
    // =====================================================================
    @DeleteMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        return ResponseEntity.ok(bookingService.cancelBooking(id, currentUser.getId()));
    }

    // =====================================================================
    // GET /api/bookings/availability?resourceId=1&date=2026-04-10
    // Check what time slots are already taken for a resource on a date
    // Who can use: any logged-in user (to show availability before booking)
    // Returns: 200 OK + list of existing bookings for that day
    // =====================================================================
    @GetMapping("/availability")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BookingResponse>> checkAvailability(
            @RequestParam Long resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(bookingService.getAvailabilityForResource(resourceId, date));
    }
}