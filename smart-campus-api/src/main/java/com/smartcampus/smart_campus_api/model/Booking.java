package com.smartcampus.smart_campus_api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

// This class = one row in the "bookings" table in MySQL
// @Entity tells Spring Boot: "this is a database table"
@Entity
@Table(name = "bookings")
@Data               // Lombok: auto-creates getters, setters, toString
@NoArgsConstructor  // Lombok: creates empty constructor
@AllArgsConstructor // Lombok: creates constructor with all fields
@Builder            // Lombok: lets us do Booking.builder().field(value).build()
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto increment ID
    private Long id;

    // Which user made this booking (links to the users table)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Which resource is being booked (lecture hall, lab, etc.)
    // We store the resource ID as a Long (Member 1 manages the Resource entity)
    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    // The name of the resource (e.g. "Lecture Hall 101") - stored for display
    @Column(name = "resource_name")
    private String resourceName;

    // Date of the booking
    @Column(nullable = false)
    private LocalDate bookingDate;

    // Start and end time
    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    // What is the booking for? (e.g. "CS Lecture", "Project Meeting")
    @Column(nullable = false)
    private String purpose;

    // How many people will attend? (optional for equipment)
    private Integer expectedAttendees;

    // Booking status: PENDING → APPROVED or REJECTED → (if approved) can be CANCELLED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    // If admin rejects or cancels, they give a reason
    private String adminRemarks;

    // Who approved/rejected (admin's user ID)
    @Column(name = "reviewed_by")
    private Long reviewedBy;

    // When was it approved/rejected
    private LocalDateTime reviewedAt;

    // Auto-set timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}