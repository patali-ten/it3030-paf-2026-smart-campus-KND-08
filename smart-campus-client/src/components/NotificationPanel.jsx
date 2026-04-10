import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../api/notifications'
import { formatDistanceToNow } from 'date-fns'

const TYPE_ICONS = {
  BOOKING_APPROVED:   '✅',
  BOOKING_REJECTED:   '❌',
  TICKET_IN_PROGRESS: '🔧',
  TICKET_RESOLVED:    '✅',
  TICKET_CLOSED:      '🔒',
  TICKET_REJECTED:    '❌',
  NEW_COMMENT:        '💬',
  SYSTEM:             '📢',
}

export default function NotificationPanel() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const panelRef = useRef(null)

  const fetchData = async () => {
    if (!user) return
    try {
      const [notifRes, countRes] = await Promise.all([
        getAllNotifications(user.userId),
        getUnreadCount(user.userId),
      ])
      setNotifications(notifRes.data)
      setUnreadCount(countRes.data.unreadCount)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMarkAsRead = async (notifId) => {
    await markAsRead(notifId, user.userId)
    fetchData()
  }

  const handleMarkAll = async () => {
    await markAllAsRead(user.userId)
    fetchData()
  }

  const handleDelete = async (notifId) => {
    await deleteNotification(notifId, user.userId)
    fetchData()
  }

  const recentNotifs = notifications.slice(0, 5)

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button — inherits Navbar styling, just swap colours */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl transition-all duration-200"
        style={{ color: 'rgba(255,255,255,0.75)' }}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse"
            style={{ backgroundColor: '#dc2626' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 top-12 w-96 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #dde3ea',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              backgroundColor: '#1e3a5f',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center gap-2">
              <Bell size={15} style={{ color: '#c9a227' }} />
              <span className="font-semibold text-white text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span
                  className="text-white text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: '#c9a227', color: '#1e3a5f' }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs flex items-center gap-1 transition-opacity hover:opacity-80"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="transition-opacity hover:opacity-80"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifs.length === 0 ? (
              <div className="text-center py-10" style={{ color: '#8a9bb0' }}>
                <Bell size={30} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              recentNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className="flex gap-3 px-4 py-3 transition-colors"
                  style={{
                    borderBottom: '1px solid #f0f2f5',
                    backgroundColor: !notif.isRead ? '#f8f6ef' : '#ffffff',
                  }}
                >
                  {/* Icon */}
                  <div className="mt-0.5 flex-shrink-0">
                    <span className="text-lg">{TYPE_ICONS[notif.type] || '🔔'}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium leading-snug"
                      style={{ color: !notif.isRead ? '#1e3a5f' : '#374151' }}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs mt-0.5 leading-relaxed line-clamp-2" style={{ color: '#5a6a7a' }}>
                      {notif.message}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#8a9bb0' }}>
                      {notif.createdAt
                        ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                        : ''}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="p-1 rounded-lg transition-colors hover:bg-[#1e3a5f]/10"
                        style={{ color: '#1e3a5f' }}
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1 rounded-lg transition-colors hover:bg-red-50"
                      style={{ color: '#8a9bb0' }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-3 text-center"
            style={{ backgroundColor: '#f8f9fb', borderTop: '1px solid #dde3ea' }}
          >
            <a
              href={`/${user?.role?.toLowerCase()}/notifications`}
              className="text-xs font-semibold transition-opacity hover:opacity-75"
              style={{ color: '#1e3a5f' }}
              onClick={() => setOpen(false)}
            >
              View all notifications →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
