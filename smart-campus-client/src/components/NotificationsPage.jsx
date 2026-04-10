import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
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
  BOOKING_APPROVED:   '✅',
  BOOKING_REJECTED:   '❌',
  TICKET_IN_PROGRESS: '🔧',
  TICKET_RESOLVED:    '✅',
  TICKET_CLOSED:      '🔒',
  TICKET_REJECTED:    '❌',
  NEW_COMMENT:        '💬',
  SYSTEM:             '📢',
}

const TYPE_LABELS = {
  BOOKING_APPROVED:   'Booking Approved',
  BOOKING_REJECTED:   'Booking Rejected',
  TICKET_IN_PROGRESS: 'Ticket Update',
  TICKET_RESOLVED:    'Ticket Resolved',
  TICKET_CLOSED:      'Ticket Closed',
  TICKET_REJECTED:    'Ticket Rejected',
  NEW_COMMENT:        'New Comment',
  SYSTEM:             'System',
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('ALL')
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

  useEffect(() => { fetchNotifications() }, [])

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

  const unreadCount = notifications.filter(n => !n.read).length
  const displayed   = filter === 'UNREAD'
    ? notifications.filter(n => !n.read)
    : notifications

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f2f5' }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold flex items-center gap-2"
              style={{ color: '#1e3a5f' }}
            >
              <Bell size={22} style={{ color: '#c9a227' }} />
              Notifications
            </h1>
            <p className="text-sm mt-1" style={{ color: '#5a6a7a' }}>
              {unreadCount} unread · {notifications.length} total
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl transition-opacity hover:opacity-90 font-medium shadow-sm"
              style={{ backgroundColor: '#1e3a5f' }}
            >
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'UNREAD'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={
                filter === f
                  ? { backgroundColor: '#1e3a5f', color: '#ffffff' }
                  : { backgroundColor: '#ffffff', color: '#5a6a7a', border: '1px solid #dde3ea' }
              }
            >
              {f === 'ALL' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#1e3a5f', borderTopColor: 'transparent' }}
            />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20" style={{ color: '#8a9bb0' }}>
            <Bell size={44} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No {filter === 'UNREAD' ? 'unread ' : ''}notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(notif => (
              <div
                key={notif.id}
                className="flex gap-4 p-4 rounded-2xl transition-all"
                style={{
                  backgroundColor: !notif.read ? '#f8f6ef' : '#ffffff',
                  border: `1px solid ${!notif.read ? '#c9a227/30' : '#dde3ea'}`,
                  borderColor: !notif.read ? 'rgba(201,162,39,0.35)' : '#dde3ea',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {/* Icon */}
                <span className="text-2xl flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[notif.type] || '🔔'}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: !notif.read ? '#1e3a5f' : '#374151' }}
                      >
                        {notif.title}
                      </p>
                      <span className="text-xs" style={{ color: '#8a9bb0' }}>
                        {TYPE_LABELS[notif.type]}
                      </span>
                    </div>
                    {!notif.read && (
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: '#c9a227' }}
                      />
                    )}
                  </div>

                  <p className="text-sm mt-1 leading-relaxed" style={{ color: '#5a6a7a' }}>
                    {notif.message}
                  </p>
                  <p className="text-xs mt-2" style={{ color: '#8a9bb0' }}>
                    {notif.createdAt
                      ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                      : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: 'rgba(30,58,95,0.08)', color: '#1e3a5f' }}
                      title="Mark as read"
                    >
                      <Check size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ backgroundColor: 'rgba(220,38,38,0.07)', color: '#dc2626' }}
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
