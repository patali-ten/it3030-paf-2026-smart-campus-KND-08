import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getAllUsers, updateUserRole, deleteUser } from '../../api/users'
import { AdminTicketsContent } from './AdminTicketsPage'
import { getAllBookings } from '../../api/bookings'
import { getAllResources } from '../../api/resources'
import { Users, Building2, CalendarCheck, Wrench, Trash2 } from 'lucide-react'
import { card, statusBadge } from '../../utils/theme'
import toast from 'react-hot-toast'

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN']

const ROLE_BADGE_STYLES = {
  ADMIN:      { background: '#fee2e2', color: '#991b1b' },
  TECHNICIAN: { background: '#fef9c3', color: '#854d0e' },
  USER:       { background: 'rgba(201,168,76,0.12)', color: 'var(--gold-dim)' },
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers]             = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [pendingBookings, setPendingBookings] = useState([])
  const [bookingCount, setBookingCount] = useState(0)
  const [resourceCount, setResourceCount] = useState(0)

  const fetchUsers = async () => {
    try { const res = await getAllUsers(); setUsers(res.data) }
    catch { toast.error('Failed to load users') }
    finally { setLoadingUsers(false) }
  }

  const fetchBookings = async () => {
    try {
      const [pendingRes, allRes] = await Promise.all([getAllBookings('PENDING'), getAllBookings()])
      setPendingBookings(pendingRes.data.slice(0, 5))
      setBookingCount(allRes.data.length)
    } catch {}
  }

  const fetchResourceCount = async () => {
    try { const res = await getAllResources(); setResourceCount(res.data.length) } catch {}
  }

  useEffect(() => { fetchUsers(); fetchBookings(); fetchResourceCount() }, [])

  const handleRoleChange = (userId, newRole) => {
    updateUserRole(userId, newRole)
      .then(() => { toast.success('Role updated'); fetchUsers() })
      .catch(() => toast.error('Failed to update role'))
  }

  const handleDelete = (userId, userName) => {
    if (!confirm(`Delete user "${userName}"?`)) return
    deleteUser(userId)
      .then(() => { toast.success('User deleted'); fetchUsers() })
      .catch(() => toast.error('Failed to delete user'))
  }

  const STAT_CARDS = [
    { label: 'Total Users',  icon: Users,        value: users.length,  path: '/admin/dashboard', accent: 'var(--gold)' },
    { label: 'Resources',    icon: Building2,    value: resourceCount, path: '/admin/resources',  accent: '#10b981' },
    { label: 'Bookings',     icon: CalendarCheck, value: bookingCount, path: '/admin/bookings',   accent: '#3b82f6' },
    { label: 'Open Tickets', icon: Wrench,       value: '—',          path: '/admin/tickets',    accent: '#ef4444' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="rounded-2xl p-8 mb-8 relative overflow-hidden" style={{ background: 'var(--navy)' }}>
          <div className="absolute right-0 top-0 w-64 h-full opacity-5"
            style={{ background: 'radial-gradient(circle at 80% 50%, var(--gold) 0%, transparent 70%)' }} />
          <p className="text-sm uppercase tracking-widest mb-1" style={{ color: 'var(--gold-light)' }}>Administration Panel</p>
          <h1 className="font-display text-3xl text-white mb-1">Admin Dashboard</h1>
          <p className="text-white/50 text-sm">Manage users, resources, and campus operations.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map(({ label, icon: Icon, value, path, accent }) => (
            <div key={label} onClick={() => navigate(path)}
              className="rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ ...card }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${accent}18` }}>
                <Icon size={20} style={{ color: accent }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: 'var(--navy)' }}>{value}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* User Management */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ ...card }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--navy)' }}>
              <Users size={17} style={{ color: 'var(--gold)' }} /> User Management
            </h2>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{users.length} users</span>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--gold)' }} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-left" style={{ background: 'var(--surface2)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                    <th className="px-6 py-3 font-semibold">User</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold">Role</th>
                    <th className="px-6 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ background: 'var(--gold-dim)' }}>
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={[...u.roles][0]}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer outline-none"
                          style={{ ...ROLE_BADGE_STYLES[[...u.roles][0]] || ROLE_BADGE_STYLES.USER, border: 'none' }}
                        >
                          {ROLES.map(r => <option key={r} value={r} style={{ background: 'white', color: 'var(--text)' }}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {u.id !== user?.userId && (
                          <button onClick={() => handleDelete(u.id, u.name)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fee2e2' }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pending Bookings */}
          <div className="rounded-2xl p-6" style={{ ...card }}>
            <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--navy)' }}>
              <CalendarCheck size={17} style={{ color: 'var(--gold)' }} /> Pending Bookings
            </h2>
            {pendingBookings.length === 0 ? (
              <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No pending bookings.</div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {pendingBookings.map(b => (
                  <div key={b.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{b.resourceName}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {b.userName} · {b.bookingDate} · {b.startTime}–{b.endTime}
                      </p>
                    </div>
                    <span style={statusBadge('PENDING')}>PENDING</span>
                  </div>
                ))}
                <div className="pt-3">
                  <Link to="/admin/bookings" className="text-sm font-medium" style={{ color: 'var(--gold-dim)' }}>Review all →</Link>
                </div>
              </div>
            )}
          </div>

          {/* Tickets widget */}
          <div className="rounded-2xl p-6" style={{ ...card }}>
            <AdminTicketsContent />
          </div>
        </div>
      </div>
    </div>
  )
}