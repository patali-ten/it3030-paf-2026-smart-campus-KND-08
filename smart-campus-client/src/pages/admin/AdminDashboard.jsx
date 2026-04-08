import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getAllUsers, updateUserRole, deleteUser } from '../../api/users'
import AdminTicketsPage from './AdminTicketsPage'


import {
  Users, Building2, CalendarCheck, Wrench,
  Shield, Trash2, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN']

const STAT_CARDS = [
  { label: 'Total Users', icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Resources', icon: Building2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Bookings', icon: CalendarCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Open Tickets', icon: Wrench, color: 'text-rose-400', bg: 'bg-rose-500/10' },
]

const ROLE_STYLES = {
  ADMIN: 'bg-rose-500/10 text-rose-400',
  TECHNICIAN: 'bg-amber-500/10 text-amber-400',
  USER: 'bg-indigo-500/10 text-indigo-400',
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

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

  useEffect(() => { fetchUsers() }, [])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole)
      toast.success('Role updated')
      fetchUsers()
    } catch {
      toast.error('Failed to update role')
    }
  }

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Delete user "${userName}"? This cannot be undone.`)) return
    try {
      await deleteUser(userId)
      toast.success('User deleted')
      fetchUsers()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const stats = [users.length, '—', '—', '—']

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Manage users, resources, and campus operations.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {STAT_CARDS.map(({ label, icon: Icon, color, bg }, i) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
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

        {/* Placeholder sections for other members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CalendarCheck size={18} className="text-amber-400" /> Pending Bookings
            </h2>
            <div className="text-center py-8 text-slate-600 text-sm">
              Pending booking approvals will appear here.<br />
              <span className="text-slate-700">(Member 2 will add this)</span>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
  <AdminTicketsPage />
</div>


        </div>
      </div>
    </div>
  )
}