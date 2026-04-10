import api from './axios'

// TICKETS
export const createTicket = (data) => api.post('/tickets', data)
export const getTicketById = (id) => api.get(`/tickets/${id}`)
export const getAllTickets = () => api.get('/tickets')
export const getMyTickets = (userId) => api.get(`/tickets/my?userId=${userId}`)
export const getAssignedTickets = (userId) => api.get(`/tickets/assigned?userId=${userId}`)
export const updateTicketStatus = (id, data) => api.patch(`/tickets/${id}/status`, data)
export const assignTicket = (id, data) => api.put(`/tickets/${id}/assign`, data)
export const deleteTicket = (id, userId) => api.delete(`/tickets/${id}?userId=${userId}`)


// ATTACHMENTS
export const addAttachment = (ticketId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/tickets/${ticketId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const deleteAttachment = (attachmentId, userId) =>
  api.delete(`/tickets/attachments/${attachmentId}?userId=${userId}`)

// COMMENTS
export const addComment = (ticketId, data) =>
  api.post(`/tickets/${ticketId}/comments`, data)
export const getComments = (ticketId) =>
  api.get(`/tickets/${ticketId}/comments`)
export const editComment = (commentId, data) =>
  api.put(`/tickets/comments/${commentId}`, data)
export const deleteComment = (commentId, userId) =>
  api.delete(`/tickets/comments/${commentId}?userId=${userId}`)