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

const TYPE_COLORS = {
  BOOKING_APPROVED: 'bg-emerald-500',
  BOOKING_REJECTED: 'bg-red-500',
  TICKET_IN_PROGRESS: 'bg-amber-500',
  TICKET_RESOLVED: 'bg-emerald-500',
  TICKET_CLOSED: 'bg-slate-500',
  TICKET_REJECTED: 'bg-red-500',
  NEW_COMMENT: 'bg-blue-500',
  SYSTEM: 'bg-purple-500',
}

const TYPE_ICONS = {
  BOOKING_APPROVED: '✅',
  BOOKING_REJECTED: '❌',
  TICKET_IN_PROGRESS: '🔧',
  TICKET_RESOLVED: '✅',
  TICKET_CLOSED: '🔒',
  TICKET_REJECTED: '❌',
  NEW_COMMENT: '💬',
  SYSTEM: '📢',
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
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Close panel when clicking outside
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

  // Show only the 5 most recent in the dropdown
  const recentNotifs = notifications.slice(0, 5)

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-indigo-400" />
              <span className="font-semibold text-white text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifs.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              recentNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex gap-3 px-4 py-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${
                    !notif.isRead ? 'bg-slate-800/30' : ''
                  }`}
                >
                  {/* Type dot */}
                  <div className="mt-1 flex-shrink-0">
                    <span className="text-lg">{TYPE_ICONS[notif.type] || '🔔'}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!notif.isRead ? 'text-white' : 'text-slate-300'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
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
                        className="text-indigo-400 hover:text-indigo-300 p-1"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="text-slate-600 hover:text-red-400 p-1"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer — View All */}
          <div className="px-4 py-3 bg-slate-800 text-center">
            <a
              href={`/${user?.role?.toLowerCase()}/notifications`}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
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