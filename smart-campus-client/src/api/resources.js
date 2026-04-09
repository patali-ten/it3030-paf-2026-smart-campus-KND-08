


import api from './axios';

// Backend maps resources at /api/resources (not under /api/v1). Override baseURL like bookings.js.
// ⚠️ CHANGE: If your API runs elsewhere, set VITE_API_BASE in .env and use import.meta.env.VITE_API_BASE
const API_BASE = '/api';

// Get all resources with optional filters
export const getAllResources = (filters = {}) => {
  return api.get('/resources', { params: filters, baseURL: API_BASE });
};

// Get single resource by ID
export const getResourceById = (id) => {
  return api.get(`/resources/${id}`, { baseURL: API_BASE });
};

// Get resource by code (e.g. LH-101)
export const getResourceByCode = (code) => {
  return api.get(`/resources/code/${encodeURIComponent(code)}`, { baseURL: API_BASE });
};

// Create new resource (Admin only)
export const createResource = (data) => {
  return api.post('/resources', data, { baseURL: API_BASE });
};

// Update resource (Admin only)
export const updateResource = (id, data) => {
  return api.put(`/resources/${id}`, data, { baseURL: API_BASE });
};

// Delete resource (Admin only)
export const deleteResource = (id) => {
  return api.delete(`/resources/${id}`, { baseURL: API_BASE });
};