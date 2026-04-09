import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getAllUsers, updateUserRole, deleteUser } from '../../api/users'
import { getAllBookings } from '../../api/bookings'
import { getAllResources } from '../../api/resources'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users, Building2, CalendarCheck, Wrench,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN']

const STAT_CARDS = [
  { label: 'Total Users',  icon: Users,         color: 'text-indigo-400', bg: 'bg-indigo-500/10',  path: '/admin/dashboard' },
  { label: 'Resources',    icon: Building2,      color: 'text-emerald-400', bg: 'bg-emerald-500/10', path: '/admin/resources' },
  { label: 'Bookings',     icon: CalendarCheck,  color: 'text-amber-400', bg: 'bg-amber-500/10',   path: '/admin/bookings' },
  { label: 'Open Tickets', icon: Wrench,         color: 'text-rose-400', bg: 'bg-rose-500/10',     path: '/admin/dashboard' },
]

const ROLE_STYLES = {
  ADMIN:      'bg-rose-500/10 text-rose-400',
  TECHNICIAN: 'bg-amber-500/10 text-amber-400',
  USER:       'bg-indigo-500/10 text-indigo-400',
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [pendingBookings, setPendingBookings] = useState([])
  const [bookingCount, setBookingCount] = useState(0)
  const [resourceCount, setResourceCount] = useState(0)

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers()
      setUsers(res.data)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const pendingRes = await getAllBookings('PENDING')
      setPendingBookings(pendingRes.data.slice(0, 5))
      const allRes = await getAllBookings()
      setBookingCount(allRes.data.length)
    } catch {
      // silently ignore
    }
  }

  // ✅ NEW: Fetch resource count
  const fetchResourceCount = async () => {
    try {
      const res = await getAllResources()
      setResourceCount(res.data.length)
    } catch {
      // silently ignore
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchBookings()
    fetchResourceCount()
  }, [])

  // ✅ FIXED: resources now shows actual count
  const stats = [users.length, resourceCount, bookingCount, '—']

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage users, resources, and campus operations.</p>
        </div>

        {/* Stats Row — ✅ NOW CLICKABLE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STAT_CARDS.map(({ label, icon: Icon, color, bg, path }, i) => (
            <div
              key={label}
              onClick={() => navigate(path)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 cursor-pointer 
                         hover:border-slate-600 hover:bg-slate-800/50 transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-2xl font-bold text-white">{stats[i]}</p>
              <p className="text-slate-500 text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* User Management Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Users size={18} className="text-indigo-400" /> User Management
            </h2>
            <span className="text-slate-500 text-sm">{users.length} users</span>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-white text-sm font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{u.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={[...u.roles][0]}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className={`text-xs px-3 py-1.5 rounded-lg border-0 font-medium cursor-pointer focus:outline-none ${
                            ROLE_STYLES[[...u.roles][0]] || ROLE_STYLES.USER
                          } bg-transparent`}
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r} className="bg-slate-800 text-white">{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {u.id !== user?.userId && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={15} />
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

        {/* Bottom sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* Pending Bookings - Member 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CalendarCheck size={18} className="text-amber-400" /> Pending Bookings
            </h2>
            {pendingBookings.length === 0 ? (
              <div className="text-center py-8 text-slate-600 text-sm">
                No pending bookings right now.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {pendingBookings.map(booking => (
                  <div key={booking.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {booking.resourceName}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {booking.userName} · {booking.bookingDate}
                      </p>
                      <p className="text-slate-600 text-xs">
                        {booking.startTime} – {booking.endTime}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      PENDING
                    </span>
                  </div>
                ))}
                <div className="pt-3">
                  <Link
                    to="/admin/bookings"
                    className="text-indigo-400 text-sm hover:underline"
                  >
                    Review all bookings →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Open Tickets - Member 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Wrench size={18} className="text-rose-400" /> Open Tickets
            </h2>
            <div className="text-center py-8 text-slate-600 text-sm">
              Open maintenance tickets will appear here.<br />
              <span className="text-slate-700">(Member 3 will add this)</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )

  function handleRoleChange(userId, newRole) {
    updateUserRole(userId, newRole)
      .then(() => { toast.success('Role updated'); fetchUsers() })
      .catch(() => toast.error('Failed to update role'))
  }

  function handleDelete(userId, userName) {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return
    deleteUser(userId)
      .then(() => { toast.success('User deleted'); fetchUsers() })
      .catch(() => toast.error('Failed to delete user'))
  }
}