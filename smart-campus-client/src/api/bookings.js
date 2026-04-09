import api from './axios'

// Note: booking endpoints are at /api/bookings (not /api/v1/bookings)
// so we override baseURL for each call

const BASE = '/bookings'
const FULL_BASE = 'http://localhost:8080/api'

// Create a new booking request
export const createBooking = (bookingData) =>
  api.post(BASE, bookingData, { baseURL: FULL_BASE })

// Get the logged-in user's own bookings
export const getMyBookings = () =>
  api.get(`${BASE}/my`, { baseURL: FULL_BASE })

// Get one booking by ID
export const getBookingById = (id) =>
  api.get(`${BASE}/${id}`, { baseURL: FULL_BASE })

export const deleteBooking = (id) =>
  api.delete(`${BASE}/${id}`, { baseURL: FULL_BASE })

export const adminDeleteBooking = (id) =>
  api.delete(`${BASE}/${id}/admin`, { baseURL: FULL_BASE })

// Admin: get all bookings, optionally filter by status
// status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | undefined
export const getAllBookings = (status) =>
  api.get(BASE, {
    baseURL: FULL_BASE,
    params: status ? { status } : {}
  })

// Admin: approve or reject a booking
// decision = { approved: true/false, remarks: "..." }
export const reviewBooking = (id, decision) =>
  api.put(`${BASE}/${id}/review`, decision, { baseURL: FULL_BASE })

// User: cancel their own booking
export const cancelBooking = (id) =>
  api.delete(`${BASE}/${id}/cancel`, { baseURL: FULL_BASE })

// Check what time slots are already taken for a resource on a date
export const checkAvailability = (resourceId, date) =>
  api.get(`${BASE}/availability`, {
    baseURL: FULL_BASE,
    params: { resourceId, date }
  })

// Get all ACTIVE resources from Member 1's API
export const getActiveResources = () =>
  api.get('/resources', {
    baseURL: 'http://localhost:8080/api',
    params: { status: 'ACTIVE' }
  })