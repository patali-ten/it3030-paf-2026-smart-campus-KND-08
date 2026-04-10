import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { getAllUsers } from '../../api/users'
import { AdminTicketsContent } from './AdminTicketsPage'
import { getAllBookings } from '../../api/bookings'
import { getAllResources } from '../../api/resources'
import { getAllTickets } from '../../api/tickets'
import { Users, Building2, CalendarCheck, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [userCount, setUserCount]           = useState(0)
  const [pendingBookings, setPendingBookings] = useState([])
  const [bookingCount, setBookingCount]     = useState(0)
  const [resourceCount, setResourceCount]   = useState(0)
  const [openTicketCount, setOpenTicketCount] = useState(0)

  const fetchData = async () => {
    try {
      const [uRes, bPending, bAll, rRes, tRes] = await Promise.all([
        getAllUsers(),
        getAllBookings('PENDING'),
        getAllBookings(),
        getAllResources(),
        getAllTickets()
      ])
      setUserCount(uRes.data.length)
      setPendingBookings(bPending.data.slice(0, 5))
      setBookingCount(bAll.data.length)
      setResourceCount(rRes.data.length)
      setOpenTicketCount(tRes.data.filter(t => t.status === 'OPEN').length)
    } catch {
      toast.error('Error fetching dashboard data')
    }
  }

  useEffect(() => { fetchData() }, [])

  const STAT_CARDS = [
    { label: 'Total Users',  icon: Users,         value: userCount,       path: '/admin/users',     accent: '#c9a84c' },
    { label: 'Resources',    icon: Building2,     value: resourceCount,   path: '/admin/resources', accent: '#10b981' },
    { label: 'Bookings',     icon: CalendarCheck, value: bookingCount,    path: '/admin/bookings',  accent: '#3b82f6' },
    { label: 'Open Tickets', icon: Wrench,        value: openTicketCount, path: '/admin/tickets',   accent: '#ef4444' },
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="rounded-2xl p-8 mb-8 relative overflow-hidden bg-[#1e3a5f] shadow-xl border-b-4 border-[#c9a84c]">
          <div className="absolute right-0 top-0 w-64 h-full opacity-10"
            style={{ background: 'radial-gradient(circle at 80% 50%, #c9a84c 0%, transparent 70%)' }} />
          <p className="text-xs uppercase tracking-widest mb-1 text-[#c9a84c] font-bold">Administration Panel</p>
          <h1 className="text-3xl text-white font-bold mb-1">Admin Dashboard</h1>
          <p className="text-white/70 text-sm">Manage campus operations and view system overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map(({ label, icon: Icon, value, path, accent }) => (
            <div key={label} onClick={() => navigate(path)}
              className="bg-white rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border border-slate-200"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm"
                style={{ background: `${accent}15` }}>
                <Icon size={24} style={{ color: accent }} />
              </div>
              <p className="text-3xl font-bold text-[#1e3a5f]">{value}</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-bold mb-5 flex items-center gap-2 text-[#1e3a5f]">
              <CalendarCheck size={18} className="text-[#c9a84c]" /> Recent Pending Bookings
            </h2>
            {pendingBookings.length === 0 ? (
              <div className="text-center py-10 text-slate-400 italic">No pending bookings.</div>
            ) : (
              <div className="space-y-3">
                {pendingBookings.map(b => (
                  <div key={b.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{b.resourceName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {b.userName} • {b.bookingDate}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-700">PENDING</span>
                  </div>
                ))}
                <div className="pt-2">
                  <Link to="/admin/bookings" className="text-sm font-bold text-[#c9a84c] hover:text-[#b08d3a] transition-colors">
                    Review all bookings →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <AdminTicketsContent />
          </div>
        </div>

      </div>
    </div>
  )
}