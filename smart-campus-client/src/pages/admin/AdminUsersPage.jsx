import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getAllUsers, updateUserRole, deleteUser } from '../../api/users'
import { Users, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN']

const ROLE_BADGE_STYLES = {
  ADMIN:      { background: '#fee2e2', color: '#991b1b' },
  TECHNICIAN: { background: '#fef9c3', color: '#854d0e' },
  USER:       { background: 'rgba(201,168,76,0.12)', color: '#c9a84c' },
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers()
      setUsers(res.data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f]">User Management</h1>
          <p className="text-slate-500 mt-1">Manage system access and assign user roles.</p>
        </div>

        {/* User Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold flex items-center gap-2 text-[#1e3a5f]">
              <Users size={18} className="text-[#c9a84c]" /> Registered Users
            </h2>
            <span className="text-xs font-bold px-3 py-1 bg-slate-200 text-slate-600 rounded-full">
              {users.length} TOTAL USERS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-left bg-slate-50 text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold bg-[#1e3a5f] shadow-inner">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={[...u.roles][0]}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg font-bold cursor-pointer outline-none border border-transparent focus:border-[#c9a84c] transition-all"
                        style={{ ...ROLE_BADGE_STYLES[[...u.roles][0]] || ROLE_BADGE_STYLES.USER }}
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r} className="bg-white text-slate-800">{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {u.id !== user?.userId && (
                        <button 
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <div className="p-10 text-center text-slate-400">Loading users...</div>}
          </div>
        </div>
      </div>
    </div>
  )
}