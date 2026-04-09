import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import { Wrench, Clock, CheckCircle, Bell, ArrowRight } from 'lucide-react'
import TechnicianTicketsPage from './TechnicianTicketsPage'
import { getAssignedTickets } from '../../api/tickets'

const ACTIONS = [
  { label: 'My Assigned Tickets', desc: 'View and update your tickets', href: '/technician/tickets', icon: Wrench, color: 'from-amber-600 to-orange-800' },
  { label: 'Notifications', desc: 'New assignments and updates', href: '/technician/notifications', icon: Bell, color: 'from-indigo-600 to-indigo-800' },
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

  const assigned = tickets.length
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length
  const resolvedToday = tickets.filter(t => {
    if (t.status !== 'RESOLVED') return false
    return new Date(t.updatedAt).toDateString() === new Date().toDateString()
  }).length

  const STAT_CARDS = [
    { label: 'Assigned to Me', icon: Wrench,       color: 'text-amber-400',   bg: 'bg-amber-500/10',   value: assigned },
    { label: 'In Progress',    icon: Clock,         color: 'text-blue-400',    bg: 'bg-blue-500/10',    value: inProgress },
    { label: 'Resolved Today', icon: CheckCircle,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', value: resolvedToday },
  ]

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            Hello, <span className="text-amber-400">{user?.name?.split(' ')[0]}</span> 🔧
          </h1>
          <p className="text-slate-400 mt-1">Manage your assigned maintenance tickets.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {STAT_CARDS.map(({ label, icon: Icon, color, bg, value }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-slate-500 text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {ACTIONS.map(({ label, desc, href, icon: Icon, color }) => (
            <a key={href} href={href}
              className={`relative overflow-hidden bg-gradient-to-br ${color} rounded-2xl p-6 group hover:scale-[1.02] transition-transform`}>
              <Icon size={28} className="text-white/80 mb-4" />
              <p className="text-white font-semibold">{label}</p>
              <p className="text-white/60 text-sm mt-1">{desc}</p>
              <ArrowRight size={18} className="absolute bottom-5 right-5 text-white/40 group-hover:text-white/80 transition-colors" />
            </a>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <TechnicianTicketsPage />
        </div>

      </div>
    </div>
  )
}