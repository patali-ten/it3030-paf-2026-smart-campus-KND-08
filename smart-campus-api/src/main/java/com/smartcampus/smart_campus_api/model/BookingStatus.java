package com.smartcampus.smart_campus_api.model;

// These are the only allowed values for booking status
// PENDING  = just created, waiting for admin to review
// APPROVED = admin said yes
// REJECTED = admin said no
// CANCELLED = was approved but then user/admin cancelled it
public enum BookingStatus {
    PENDING,
    APPROVED,
    REJECTED,
    CANCELLED
}