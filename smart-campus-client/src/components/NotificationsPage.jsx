import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../api/notifications'
import { formatDistanceToNow } from 'date-fns'
import Navbar from './Navbar'

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

const TYPE_LABELS = {
  BOOKING_APPROVED: 'Booking Approved',
  BOOKING_REJECTED: 'Booking Rejected',
  TICKET_IN_PROGRESS: 'Ticket Update',
  TICKET_RESOLVED: 'Ticket Resolved',
  TICKET_CLOSED: 'Ticket Closed',
  TICKET_REJECTED: 'Ticket Rejected',
  NEW_COMMENT: 'New Comment',
  SYSTEM: 'System',
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('ALL') // ALL | UNREAD
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const res = await getAllNotifications(user.userId)
      setNotifications(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id) => {
    await markAsRead(id, user.userId)
    fetchNotifications()
  }

  const handleMarkAll = async () => {
    await markAllAsRead(user.userId)
    fetchNotifications()
  }

  const handleDelete = async (id) => {
    await deleteNotification(id, user.userId)
    fetchNotifications()
  }

  const displayed = filter === 'UNREAD'
    ? notifications.filter(n => !n.isRead)
    : notifications

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell className="text-indigo-400" /> Notifications
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {unreadCount} unread · {notifications.length} total
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-xl transition-colors"
            >
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'UNREAD'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f === 'ALL' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Bell size={48} className="mx-auto mb-3 opacity-20" />
            <p>No {filter === 'UNREAD' ? 'unread ' : ''}notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(notif => (
              <div
                key={notif.id}
                className={`flex gap-4 p-4 rounded-2xl border transition-all ${
                  !notif.isRead
                    ? 'bg-slate-800/60 border-indigo-500/30'
                    : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[notif.type] || '🔔'}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`font-semibold text-sm ${!notif.isRead ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                      </p>
                      <span className="text-xs text-slate-600">
                        {TYPE_LABELS[notif.type]}
                      </span>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-slate-600 text-xs mt-2">
                    {notif.createdAt
                      ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                      : ''}
                  </p>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                      title="Mark as read"
                    >
                      <Check size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}