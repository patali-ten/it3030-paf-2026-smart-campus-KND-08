import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ROLE_STYLES = {
  ADMIN: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: 'Administrator' },
  TECHNICIAN: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Technician' },
  USER: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', label: 'Campus User' },
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const roleStyle = ROLE_STYLES[user?.role] || ROLE_STYLES.USER

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold text-white mb-8">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-6">
          {/* Avatar */}
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

          {/* Info Grid */}
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

        {/* Danger Zone */}
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