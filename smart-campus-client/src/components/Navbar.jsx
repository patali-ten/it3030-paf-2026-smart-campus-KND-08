import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationPanel from './NotificationPanel'
import {
  LogOut, User, Menu, X,
  LayoutDashboard, Building2, CalendarCheck,
  Wrench, Users, Bell
} from 'lucide-react'

const NAV_LINKS = {
  USER: [
    { label: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
    { label: 'Resources', href: '/user/resources', icon: Building2 },
    { label: 'Bookings', href: '/user/bookings', icon: CalendarCheck },
    { label: 'My Tickets', href: '/user/tickets', icon: Wrench },
    { label: 'Notifications', href: '/user/notifications', icon: Bell },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Resources', href: '/admin/resources', icon: Building2 },
    { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
    { label: 'Tickets', href: '/admin/tickets', icon: Wrench },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  ],
  TECHNICIAN: [
    { label: 'Dashboard', href: '/technician/dashboard', icon: LayoutDashboard },
    { label: 'My Tickets', href: '/technician/tickets', icon: Wrench },
    { label: 'Notifications', href: '/technician/notifications', icon: Bell },
  ],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = NAV_LINKS[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const ROLE_BADGE = {
    ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    TECHNICIAN: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    USER: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  }

  // Check if current path matches the link
  const isActive = (href) => location.pathname === href

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to={`/${user?.role?.toLowerCase()}/dashboard`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm hidden sm:block">SmartCampus</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200
                ${isActive(href)
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <NotificationPanel />

          {/* Role Badge */}
          <span className={`hidden sm:flex text-xs px-2 py-1 rounded-full border font-medium ${ROLE_BADGE[user?.role] || ''}`}>
            {user?.role}
          </span>

          {/* Profile */}
          <Link
            to={`/${user?.role?.toLowerCase()}/profile`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <span className="hidden sm:block text-sm text-slate-300">{user?.name}</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-slate-400"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 px-4 py-3 flex flex-col gap-1">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all
                ${isActive(href)
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}