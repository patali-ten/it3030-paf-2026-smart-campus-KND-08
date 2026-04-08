import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import { User, Mail, Shield, Calendar, LogOut, Bell, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../api/notifications'
import toast from 'react-hot-toast'

const ROLE_STYLES = {
  ADMIN: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: 'Administrator' },
  TECHNICIAN: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Technician' },
  USER: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', label: 'Campus User' },
}

const PREFERENCE_CONFIG = [
  { type: 'BOOKING_APPROVED', label: 'Booking Approved', desc: 'When your booking request is approved by an admin', icon: '✅', group: 'Bookings' },
  { type: 'BOOKING_REJECTED', label: 'Booking Rejected', desc: 'When your booking request is declined', icon: '❌', group: 'Bookings' },
  { type: 'TICKET_IN_PROGRESS', label: 'Ticket In Progress', desc: 'When a technician starts working on your ticket', icon: '🔧', group: 'Tickets' },
  { type: 'TICKET_RESOLVED', label: 'Ticket Resolved', desc: 'When your maintenance ticket is marked resolved', icon: '✅', group: 'Tickets' },
  { type: 'TICKET_CLOSED', label: 'Ticket Closed', desc: 'When your ticket is officially closed', icon: '🔒', group: 'Tickets' },
  { type: 'TICKET_REJECTED', label: 'Ticket Rejected', desc: 'When your ticket is rejected by an admin', icon: '❌', group: 'Tickets' },
  { type: 'NEW_COMMENT', label: 'New Comment', desc: 'When someone comments on your ticket', icon: '💬', group: 'Tickets' },
  { type: 'SYSTEM', label: 'System Announcements', desc: 'General platform updates and announcements', icon: '📢', group: 'System' },
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

  // Only fetch preferences if the logged-in person is a USER
  useEffect(() => {
    if (!isUser || !user?.userId) {
      setLoadingPrefs(false)
      return
    }
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold text-white mb-8">My Profile</h1>

        {/* ── Profile Card ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              <span className={`inline-flex items-center gap-1.5 mt-2 text-xs px-3 py-1 rounded-full border font-medium ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                <Shield size={11} />
                {roleStyle.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <User size={13} /> Full Name
              </div>
              <p className="text-white font-medium">{user?.name}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Mail size={13} /> Email Address
              </div>
              <p className="text-white font-medium">{user?.email || 'via Google'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Shield size={13} /> Role
              </div>
              <p className={`font-medium ${roleStyle.text}`}>{roleStyle.label}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Calendar size={13} /> User ID
              </div>
              <p className="text-white font-medium">#{user?.userId}</p>
            </div>
          </div>
        </div>

        {/* ── Notification Preferences — USER only ── */}
        {isUser && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Bell size={17} className="text-indigo-400" />
                Notification Preferences
              </h3>
              <span className="text-xs text-slate-500">
                {enabledTypes.size} of {PREFERENCE_CONFIG.length} enabled
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Choose which notifications you want to receive. Disabled types won't appear in your notification panel.
            </p>

            {loadingPrefs ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {GROUPS.map(group => {
                  const groupItems = PREFERENCE_CONFIG.filter(p => p.group === group)
                  const allOn = groupItems.every(p => enabledTypes.has(p.type))

                  return (
                    <div key={group}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {group}
                        </span>
                        <button
                          onClick={() => handleToggleGroup(group)}
                          className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                            allOn
                              ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                              : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {allOn ? 'Disable all' : 'Enable all'}
                        </button>
                      </div>

                      <div className="space-y-2">
                        {groupItems.map(({ type, label, desc, icon }) => {
                          const isOn = enabledTypes.has(type)
                          return (
                            <div
                              key={type}
                              onClick={() => handleToggle(type)}
                              className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all select-none ${
                                isOn
                                  ? 'bg-slate-800/60 border-slate-700 hover:border-indigo-500/40'
                                  : 'bg-slate-900/40 border-slate-800/50 opacity-50 hover:opacity-70'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{icon}</span>
                                <div>
                                  <p className="text-sm font-medium text-white">{label}</p>
                                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                                </div>
                              </div>
                              <div className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                                isOn ? 'bg-indigo-600' : 'bg-slate-700'
                              }`}>
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                  isOn ? 'translate-x-5' : 'translate-x-0.5'
                                }`} />
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
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Preferences
                </>
              )}
            </button>
          </div>
        )}

        {/* ── Sign Out ── */}
        <div className="bg-slate-900 border border-red-900/30 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-1">Sign Out</h3>
          <p className="text-slate-400 text-sm mb-4">You will be returned to the login page.</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}