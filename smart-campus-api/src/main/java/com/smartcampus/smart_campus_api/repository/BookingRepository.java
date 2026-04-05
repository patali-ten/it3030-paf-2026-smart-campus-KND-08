package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.Booking;
import com.smartcampus.smart_campus_api.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

// This interface handles all database operations for Booking
// JpaRepository gives us free methods: save(), findById(), findAll(), delete(), etc.
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Get all bookings made by a specific user
    List<Booking> findByUserId(Long userId);

    // Get all bookings for a specific resource
    List<Booking> findByResourceId(Long resourceId);

    // Get bookings by status (e.g. all PENDING bookings for admin to review)
    List<Booking> findByStatus(BookingStatus status);

    // Get bookings for a user filtered by status
    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);

    // *** CONFLICT CHECKING QUERY ***
    // This checks: is there already an APPROVED booking for the same resource
    // on the same date where the time overlaps?
    // Overlap happens when: newStart < existingEnd AND newEnd > existingStart
    // We exclude REJECTED and CANCELLED bookings from conflict check
    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime")
    List<Booking> findConflictingBookings(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    // Same as above but excluding a specific booking ID
    // (used when editing a booking - don't conflict with itself)
    @Query("SELECT b FROM Booking b WHERE b.resourceId = :resourceId " +
           "AND b.bookingDate = :date " +
           "AND b.status IN ('PENDING', 'APPROVED') " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime " +
           "AND b.id <> :excludeId")
    List<Booking> findConflictingBookingsExcluding(
            @Param("resourceId") Long resourceId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId
    );

    // Get all bookings for a resource on a specific date (for availability view)
    List<Booking> findByResourceIdAndBookingDate(Long resourceId, LocalDate date);
}