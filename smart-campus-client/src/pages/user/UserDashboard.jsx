import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { CalendarCheck, Wrench, Bell, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom' // Added for SPA navigation

const QUICK_ACTIONS = [
  { label: 'Book a Resource', desc: 'Reserve rooms, labs & equipment', href: '/user/bookings', icon: CalendarCheck, color: 'from-indigo-600 to-indigo-800' },
  { label: 'Report an Issue', desc: 'Submit a maintenance ticket', href: '/user/tickets', icon: Wrench, color: 'from-amber-600 to-orange-800' },
  { label: 'Notifications', desc: 'Check your latest updates', href: '/user/notifications', icon: Bell, color: 'from-purple-600 to-purple-800' },
]

export default function UserDashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            Hello, <span className="text-indigo-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's what you can do today.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {QUICK_ACTIONS.map(({ label, desc, href, icon: Icon, color }) => (
            <Link
              key={href}
              to={href}
              className={`relative overflow-hidden bg-gradient-to-br ${color} rounded-2xl p-6 group hover:scale-[1.02] transition-transform block`}
            >
              <Icon size={28} className="text-white/80 mb-4" />
              <p className="text-white font-semibold">{label}</p>
              <p className="text-white/60 text-sm mt-1">{desc}</p>
              <ArrowRight size={18} className="absolute bottom-5 right-5 text-white/40 group-hover:text-white/80 transition-colors" />
            </Link>
          ))}
        </div>

        {/* Placeholder sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <CalendarCheck size={18} className="text-indigo-400" /> My Recent Bookings
            </h2>
            <div className="text-center py-8 text-slate-600 text-sm">
              Your bookings will appear here.<br />
              <span className="text-slate-700">(Member 2 will add this)</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Wrench size={18} className="text-amber-400" /> My Open Tickets
            </h2>
            <div className="text-center py-8 text-slate-600 text-sm">
              Your tickets will appear here.<br />
              <span className="text-slate-700">(Member 3 will add this)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}