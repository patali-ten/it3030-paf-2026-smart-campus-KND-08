import api from './axios'

export const getAllNotifications = (userId) =>
  api.get(`/notifications/user/${userId}`)

export const getUnreadCount = (userId) =>
  api.get(`/notifications/user/${userId}/unread-count`)

export const markAsRead = (notificationId, userId) =>
  api.put(`/notifications/${notificationId}/read?userId=${userId}`)

export const markAllAsRead = (userId) =>
  api.put(`/notifications/user/${userId}/read-all`)

export const deleteNotification = (notificationId, userId) =>
  api.delete(`/notifications/${notificationId}?userId=${userId}`)