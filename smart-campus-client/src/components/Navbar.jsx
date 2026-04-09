import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationPanel from './NotificationPanel'
import {
  LogOut, Menu, X, LayoutDashboard, Building2,
  CalendarCheck, Wrench, Users, Bell, GraduationCap
} from 'lucide-react'

const NAV_LINKS = {
  USER: [
    { label: 'Dashboard',     href: '/user/dashboard',       icon: LayoutDashboard },
    { label: 'Resources',     href: '/user/resources',       icon: Building2 },
    { label: 'Bookings',      href: '/user/bookings',        icon: CalendarCheck },
    { label: 'My Tickets',    href: '/user/tickets',         icon: Wrench },
    { label: 'Notifications', href: '/user/notifications',   icon: Bell },
  ],
  ADMIN: [
    { label: 'Dashboard',     href: '/admin/dashboard',      icon: LayoutDashboard },
    { label: 'Resources',     href: '/admin/resources',      icon: Building2 },
    { label: 'Bookings',      href: '/admin/bookings',       icon: CalendarCheck },
    { label: 'Tickets',       href: '/admin/tickets',        icon: Wrench },
    { label: 'Users',         href: '/admin/users',          icon: Users },
    { label: 'Notifications', href: '/admin/notifications',  icon: Bell },
  ],
  TECHNICIAN: [
    { label: 'Dashboard',     href: '/technician/dashboard',      icon: LayoutDashboard },
    { label: 'My Tickets',    href: '/technician/tickets',        icon: Wrench },
    { label: 'Notifications', href: '/technician/notifications',  icon: Bell },
  ],
}

const ROLE_BADGE = {
  ADMIN:      { bg: '#7f1d1d22', text: '#fca5a5', border: '#7f1d1d55', label: 'Admin' },
  TECHNICIAN: { bg: '#78350f22', text: '#fcd34d', border: '#78350f55', label: 'Technician' },
  USER:       { bg: 'rgba(201,168,76,0.12)', text: '#C9A84C', border: 'rgba(201,168,76,0.3)', label: 'User' },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = NAV_LINKS[user?.role] || []
  const badge = ROLE_BADGE[user?.role] || ROLE_BADGE.USER
  const isActive = (href) => location.pathname === href

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl"
      style={{
        background: 'rgba(17,29,51,0.96)',
        borderBottom: '1px solid rgba(201,168,76,0.18)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to={`/${user?.role?.toLowerCase()}/dashboard`} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold)' }}>
            <GraduationCap size={16} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-semibold text-sm leading-none">SilverWood</p>
            <p className="text-xs uppercase tracking-widest leading-none mt-0.5" style={{ color: 'var(--gold-light)', fontSize: '9px' }}>University</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-0.5">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href} to={href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 font-medium"
              style={isActive(href) ? {
                background: 'rgba(201,168,76,0.15)',
                color: 'var(--gold-light)',
                border: '1px solid rgba(201,168,76,0.25)',
              } : {
                color: 'rgba(255,255,255,0.55)',
                border: '1px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive(href)) e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { if (!isActive(href)) e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <NotificationPanel />

          {/* Role Badge */}
          <span
            className="hidden sm:flex text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide"
            style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}
          >
            {badge.label}
          </span>

          {/* Profile */}
          <Link
            to={`/${user?.role?.toLowerCase()}/profile`}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all"
            style={{ border: '1px solid transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'var(--gold-dim)' }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{user?.name}</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl transition-all"
            title="Logout"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={17} />
          </button>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" style={{ color: 'rgba(255,255,255,0.6)' }} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{ background: 'var(--navy-dark)', borderTop: '1px solid rgba(201,168,76,0.12)' }} className="md:hidden px-4 py-3 flex flex-col gap-1">
          {links.map(({ label, href, icon: Icon }) => (
            <Link
              key={href} to={href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={isActive(href)
                ? { color: 'var(--gold-light)', background: 'rgba(201,168,76,0.12)' }
                : { color: 'rgba(255,255,255,0.6)' }}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={15} />{label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}