import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import { User, Mail, Shield, LogOut, Bell, Save, Hash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../api/notifications'
import toast from 'react-hot-toast'

const ROLE_STYLES = {
  ADMIN: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    label: 'Administrator',
    avatarBg: '#be123c',
    heroBg: 'linear-gradient(135deg, #1e3a5f 0%, #3b1f5e 100%)',
    heroAccent: '#be123c',
  },
  TECHNICIAN: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    label: 'Technician',
    avatarBg: '#92400e',
    heroBg: 'linear-gradient(135deg, #1e3a5f 0%, #3d2a00 100%)',
    heroAccent: '#c9a227',
  },
  USER: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Campus User',
    avatarBg: '#1e3a5f',
    heroBg: 'linear-gradient(135deg, #1e3a5f 0%, #1e5f4a 100%)',
    heroAccent: '#c9a227',
  },
}

const PREFERENCE_CONFIG = [
  { type: 'BOOKING_APPROVED',   label: 'Booking Approved',     desc: 'When your booking request is approved by an admin',   icon: '✅', group: 'Bookings' },
  { type: 'BOOKING_REJECTED',   label: 'Booking Rejected',     desc: 'When your booking request is declined',               icon: '❌', group: 'Bookings' },
  { type: 'TICKET_IN_PROGRESS', label: 'Ticket In Progress',   desc: 'When a technician starts working on your ticket',     icon: '🔧', group: 'Tickets'  },
  { type: 'TICKET_RESOLVED',    label: 'Ticket Resolved',      desc: 'When your maintenance ticket is marked resolved',     icon: '✅', group: 'Tickets'  },
  { type: 'TICKET_CLOSED',      label: 'Ticket Closed',        desc: 'When your ticket is officially closed',               icon: '🔒', group: 'Tickets'  },
  { type: 'TICKET_REJECTED',    label: 'Ticket Rejected',      desc: 'When your ticket is rejected by an admin',            icon: '❌', group: 'Tickets'  },
  { type: 'NEW_COMMENT',        label: 'New Comment',          desc: 'When someone comments on your ticket',                icon: '💬', group: 'Tickets'  },
  { type: 'SYSTEM',             label: 'System Announcements', desc: 'General platform updates and announcements',          icon: '📢', group: 'System'   },
]

const GROUPS = ['Bookings', 'Tickets', 'System']

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const roleStyle = ROLE_STYLES[user?.role] || ROLE_STYLES.USER
  const isUser = user?.role === 'USER'

  const [enabledTypes, setEnabledTypes] = useState(new Set())
  const [loadingPrefs, setLoadingPrefs] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isUser || !user?.userId) { setLoadingPrefs(false); return }
    getNotificationPreferences(user.userId)
      .then(res => setEnabledTypes(new Set(res.data.enabledTypes)))
      .catch(() => setEnabledTypes(new Set(PREFERENCE_CONFIG.map(p => p.type))))
      .finally(() => setLoadingPrefs(false))
  }, [user])

  const handleToggle = (type) => {
    setEnabledTypes(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  const handleToggleGroup = (group) => {
    const groupTypes = PREFERENCE_CONFIG.filter(p => p.group === group).map(p => p.type)
    const allOn = groupTypes.every(t => enabledTypes.has(t))
    setEnabledTypes(prev => {
      const next = new Set(prev)
      groupTypes.forEach(t => allOn ? next.delete(t) : next.add(t))
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateNotificationPreferences(user.userId, [...enabledTypes])
      toast.success('Notification preferences saved!')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f2f5' }}>
      <Navbar />

      {/* Full-width content area with generous padding */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">

        {/* ── Page title ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>My Profile</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6a7a' }}>
            Manage your account details{isUser ? ' and notification preferences' : ''}.
          </p>
        </div>

        {/* ── Two-column layout on large screens ── */}
        <div className={`grid gap-6 ${isUser ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-3'}`}>

          {/* ── LEFT: Profile card (takes 1 col on lg) ── */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* Hero card */}
            <div
              className="rounded-3xl overflow-hidden shadow-md"
              style={{ border: '1px solid #dde3ea' }}
            >
              {/* Banner */}
              <div className="relative h-32" style={{ background: roleStyle.heroBg }}>
                <div
                  className="absolute -top-4 -right-4 w-36 h-36 rounded-full opacity-10"
                  style={{ backgroundColor: roleStyle.heroAccent }}
                />
                <div
                  className="absolute top-6 right-12 w-14 h-14 rounded-full opacity-10"
                  style={{ backgroundColor: '#ffffff' }}
                />
                <div
                  className="absolute bottom-3 left-1/2 w-8 h-8 rounded-full opacity-10"
                  style={{ backgroundColor: '#ffffff' }}
                />
                {/* Avatar */}
                <div
                  className="absolute -bottom-9 left-6 w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-xl z-10"
                  style={{ backgroundColor: roleStyle.avatarBg, border: '3px solid #ffffff' }}
                >
                  {initials}
                </div>
              </div>

              {/* Name / email / role badge */}
              <div className="bg-white pt-12 pb-6 px-6">
                <h2 className="text-lg font-bold leading-tight" style={{ color: '#1e3a5f' }}>{user?.name}</h2>
                <p className="text-sm mt-0.5 truncate" style={{ color: '#5a6a7a' }}>{user?.email}</p>
                <span
                  className={`inline-flex items-center gap-1.5 mt-3 text-xs px-3 py-1 rounded-full border font-semibold ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                >
                  <Shield size={11} />
                  {roleStyle.label}
                </span>
              </div>
            </div>

            {/* Sign Out card */}
            <div
              className="rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: '#ffffff', border: '1px solid #fecaca' }}
            >
              <h3 className="font-semibold mb-1 text-sm" style={{ color: '#1e3a5f' }}>Sign Out</h3>
              <p className="text-xs mb-4" style={{ color: '#5a6a7a' }}>You will be returned to the login page.</p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 w-full justify-center"
                style={{
                  backgroundColor: 'rgba(220,38,38,0.07)',
                  border: '1px solid rgba(220,38,38,0.2)',
                  color: '#dc2626',
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>

          {/* ── RIGHT: Details + preferences (takes 2 cols on lg) ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Account details card */}
            <div
              className="rounded-2xl p-6 shadow-sm"
              style={{ backgroundColor: '#ffffff', border: '1px solid #dde3ea' }}
            >
              <h3 className="font-semibold mb-5 text-sm" style={{ color: '#1e3a5f' }}>Account Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: User,   label: 'Full Name',     value: user?.name },
                  { icon: Mail,   label: 'Email Address', value: user?.email || 'via Google' },
                  { icon: Shield, label: 'Role',          value: roleStyle.label, accent: true },
                  { icon: Hash,   label: 'User ID',       value: `#${user?.userId}` },
                ].map(({ icon: Icon, label, value, accent }) => (
                  <div
                    key={label}
                    className="rounded-xl p-4"
                    style={{ backgroundColor: '#f8f9fb', border: '1px solid #dde3ea' }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5" style={{ color: '#8a9bb0' }}>
                      <Icon size={12} />
                      <span className="text-xs">{label}</span>
                    </div>
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: accent ? roleStyle.avatarBg : '#1e3a5f' }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification preferences — USER only */}
            {isUser && (
              <div
                className="rounded-2xl p-6 shadow-sm"
                style={{ backgroundColor: '#ffffff', border: '1px solid #dde3ea' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold flex items-center gap-2 text-sm" style={{ color: '#1e3a5f' }}>
                    <Bell size={15} style={{ color: '#c9a227' }} />
                    Notification Preferences
                  </h3>
                  <span className="text-xs" style={{ color: '#8a9bb0' }}>
                    {enabledTypes.size} of {PREFERENCE_CONFIG.length} enabled
                  </span>
                </div>
                <p className="text-sm mb-6" style={{ color: '#5a6a7a' }}>
                  Choose which notifications you want to receive. Disabled types won't appear in your notification panel.
                </p>

                {loadingPrefs ? (
                  <div className="flex justify-center py-8">
                    <div
                      className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: '#1e3a5f', borderTopColor: 'transparent' }}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {GROUPS.map(group => {
                      const groupItems = PREFERENCE_CONFIG.filter(p => p.group === group)
                      const allOn = groupItems.every(p => enabledTypes.has(p.type))

                      return (
                        <div key={group}>
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className="text-xs font-bold uppercase tracking-wider"
                              style={{ color: '#8a9bb0' }}
                            >
                              {group}
                            </span>
                            <button
                              onClick={() => handleToggleGroup(group)}
                              className="text-xs px-2.5 py-1 rounded-lg transition-colors font-medium"
                              style={
                                allOn
                                  ? { backgroundColor: 'rgba(30,58,95,0.08)', color: '#1e3a5f' }
                                  : { backgroundColor: '#f8f9fb', color: '#5a6a7a', border: '1px solid #dde3ea' }
                              }
                            >
                              {allOn ? 'Disable all' : 'Enable all'}
                            </button>
                          </div>

                          {/* Two-column grid for preference items */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {groupItems.map(({ type, label, desc, icon }) => {
                              const isOn = enabledTypes.has(type)
                              return (
                                <div
                                  key={type}
                                  onClick={() => handleToggle(type)}
                                  className="flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all select-none"
                                  style={{
                                    backgroundColor: isOn ? '#f8f9fb' : '#fafafa',
                                    border: `1px solid ${isOn ? '#c9a227' : '#dde3ea'}`,
                                    opacity: isOn ? 1 : 0.55,
                                  }}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-base flex-shrink-0">{icon}</span>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium truncate" style={{ color: '#1e3a5f' }}>{label}</p>
                                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#8a9bb0' }}>{desc}</p>
                                    </div>
                                  </div>
                                  {/* Toggle pill */}
                                  <div
                                    className="relative w-9 h-5 rounded-full flex-shrink-0 ml-2"
                                    style={{ backgroundColor: isOn ? '#1e3a5f' : '#dde3ea' }}
                                  >
                                    <div
                                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                                      style={{ transform: isOn ? 'translateX(16px)' : 'translateX(2px)' }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving || loadingPrefs}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#1e3a5f' }}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <><Save size={15} /> Save Preferences</>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
