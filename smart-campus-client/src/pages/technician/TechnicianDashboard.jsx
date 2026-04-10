import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import { Wrench, Clock, CheckCircle, Bell, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TechnicianTicketsContent } from './TechnicianTicketsPage'
import { getAssignedTickets } from '../../api/tickets'

const ACTIONS = [
  {
    label: 'My Assigned Tickets',
    desc: 'View and update your tickets',
    href: '/technician/tickets',
    icon: Wrench,
    accent: '#c9a227',
    bg: 'bg-[#1e3a5f]',
  },
  {
    label: 'Notifications',
    desc: 'New assignments and updates',
    href: '/technician/notifications',
    icon: Bell,
    accent: '#c9a227',
    bg: 'bg-[#1e3a5f]',
  },
]

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAssignedTickets(user.userId)
        setTickets(res.data)
      } catch {}
    }
    fetch()
  }, [])

  const assigned      = tickets.length
  const inProgress    = tickets.filter(t => t.status === 'IN_PROGRESS').length
  const resolvedToday = tickets.filter(t => {
    if (t.status !== 'RESOLVED') return false
    return new Date(t.updatedAt).toDateString() === new Date().toDateString()
  }).length

  const STAT_CARDS = [
    { label: 'Assigned to Me', icon: Wrench,      value: assigned,      border: 'border-[#c9a227]/40', iconBg: 'bg-[#c9a227]/10', iconColor: 'text-[#c9a227]' },
    { label: 'In Progress',    icon: Clock,        value: inProgress,    border: 'border-[#1e3a5f]/30', iconBg: 'bg-[#1e3a5f]/10', iconColor: 'text-[#1e3a5f]' },
    { label: 'Resolved Today', icon: CheckCircle,  value: resolvedToday, border: 'border-green-500/30',  iconBg: 'bg-green-500/10',  iconColor: 'text-green-600'  },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f2f5' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold" style={{ color: '#1e3a5f' }}>
            Hello, <span style={{ color: '#c9a227' }}>{user?.name?.split(' ')[0]}</span> 🔧
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#5a6a7a' }}>
            Manage your assigned maintenance tickets.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {STAT_CARDS.map(({ label, icon: Icon, value, border, iconBg, iconColor }) => (
            <div
              key={label}
              className={`bg-white rounded-2xl p-5 border ${border} shadow-sm`}
            >
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={iconColor} />
              </div>
              <p className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>{value}</p>
              <p className="text-sm mt-0.5" style={{ color: '#5a6a7a' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {ACTIONS.map(({ label, desc, href, icon: Icon, bg }) => (
            <Link
              key={href}
              to={href}
              className={`relative overflow-hidden ${bg} rounded-2xl p-6 group hover:opacity-90 transition-opacity shadow-md`}
            >
              <Icon size={26} className="mb-4" style={{ color: '#c9a227' }} />
              <p className="font-semibold text-white">{label}</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{desc}</p>
              <ArrowRight
                size={18}
                className="absolute bottom-5 right-5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              />
            </Link>
          ))}
        </div>

        {/* Assigned Tickets widget */}
        <div className="bg-white border border-[#dde3ea] rounded-2xl p-6 shadow-sm">
          <TechnicianTicketsContent />
        </div>

      </div>
    </div>
  )
}
