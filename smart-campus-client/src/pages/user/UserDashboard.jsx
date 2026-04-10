import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { CalendarCheck, Wrench, Bell, ArrowRight, Building2, Clock, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMyBookings } from '../../api/bookings'
import { MyTicketsContent } from './MyTicketsPage'

const CAMPUS_IMG = '/src/assets/campus_building.jpg'

const QUICK_ACTIONS = [
  { label: 'Browse Facilities', desc: 'Rooms, labs & equipment catalogue', href: '/user/resources',      icon: Building2,    num: '01' },
  { label: 'Book a Resource',   desc: 'Reserve rooms, labs & equipment',   href: '/user/bookings',       icon: CalendarCheck, num: '02' },
  { label: 'Report an Issue',   desc: 'Submit a maintenance ticket',       href: '/user/tickets',        icon: Wrench,        num: '03' },
  { label: 'Notifications',     desc: 'Check your latest updates',         href: '/user/notifications',  icon: Bell,          num: '04' },
]

const STATUS_STYLES = {
  PENDING:   'bg-amber-100 text-amber-700 border border-amber-200',
  APPROVED:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  REJECTED:  'bg-red-100 text-red-700 border border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border border-gray-200',
}

export default function UserDashboard() {
  const { user } = useAuth()
  const [recentBookings, setRecentBookings] = useState([])

  useEffect(() => {
    getMyBookings()
      .then(res => setRecentBookings(res.data.slice(0, 3)))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f2f5' }}>
      <Navbar />

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden" style={{ height: 300, marginTop: 64 }}>
        <img
          src={CAMPUS_IMG}
          alt="SilverWood Campus"
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.5)' }}
          onError={e => { e.target.style.display = 'none' }}
        />
        {/* Fallback gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #1e5f4a 100%)',
            zIndex: -1,
          }}
        />
        {/* Gold corner */}
        <div className="absolute bottom-0 right-0" style={{
          width: 280, height: 280,
          background: 'linear-gradient(135deg, transparent 50%, rgba(201,162,39,0.2) 50%)',
        }} />
        <div
          className="absolute inset-0 flex flex-col justify-end px-10 pb-10"
          style={{ background: 'linear-gradient(to top, rgba(30,58,95,0.88) 0%, transparent 60%)' }}
        >
          <p className="text-4xl font-bold text-white mb-1">
            Hello, <span style={{ color: '#c9a227' }}>{user?.name?.split(' ')[0]}</span> 👋
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, letterSpacing: '0.06em' }}>
            SILVERWOOD UNIVERSITY · SMART CAMPUS HUB
          </p>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-6">
          <div style={{ width: 28, height: 2, backgroundColor: '#c9a227' }} />
          <p className="font-semibold text-sm tracking-wide" style={{ color: '#1e3a5f' }}>QUICK ACTIONS</p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {QUICK_ACTIONS.map(({ label, desc, href, icon: Icon, num }) => (
            <Link
              key={href}
              to={href}
              className="group relative block rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #dde3ea',
                boxShadow: '0 2px 8px rgba(30,58,95,0.06)',
              }}
            >
              <p className="text-5xl font-bold mb-4 select-none leading-none"
                style={{ color: '#1e3a5f', opacity: 0.06 }}>{num}</p>
              <div
                className="inline-flex items-center justify-center rounded-xl mb-4"
                style={{ backgroundColor: '#1e3a5f', width: 44, height: 44 }}
              >
                <Icon size={20} style={{ color: '#c9a227' }} />
              </div>
              <p className="font-bold text-sm mb-1" style={{ color: '#1e3a5f' }}>{label}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#5a6a7a' }}>{desc}</p>
              <ArrowRight
                size={15}
                className="absolute bottom-5 right-5 transition-all duration-200 opacity-30 group-hover:opacity-80 group-hover:translate-x-1"
                style={{ color: '#c9a227' }}
              />
            </Link>
          ))}
        </div>

        {/* Two-column widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Bookings */}
          <div
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ backgroundColor: '#ffffff', border: '1px solid #dde3ea' }}
          >
            {/* Card header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid #f0f2f5' }}
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center rounded-xl"
                  style={{ backgroundColor: '#1e3a5f', width: 36, height: 36 }}>
                  <CalendarCheck size={16} style={{ color: '#c9a227' }} />
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e3a5f' }}>My Recent Bookings</p>
              </div>
              <Link
                to="/user/bookings"
                className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: '#c9a227' }}
              >
                View all <ChevronRight size={13} />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                <div className="rounded-full mb-4 flex items-center justify-center"
                  style={{ width: 52, height: 52, backgroundColor: '#f8f9fb' }}>
                  <CalendarCheck size={22} style={{ color: '#c9a227' }} />
                </div>
                <p className="font-semibold text-sm mb-1" style={{ color: '#1e3a5f' }}>No bookings yet</p>
                <p className="text-xs mb-4" style={{ color: '#5a6a7a' }}>Reserve your first space on campus</p>
                <Link
                  to="/user/bookings"
                  className="text-xs font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#1e3a5f', color: '#c9a227' }}
                >
                  Book Now
                </Link>
              </div>
            ) : (
              <div>
                {recentBookings.map((booking, i) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[#f8f9fb]"
                    style={{ borderBottom: i < recentBookings.length - 1 ? '1px solid #f0f2f5' : 'none' }}
                  >
                    <div>
                      <p className="font-semibold text-sm mb-0.5" style={{ color: '#1e3a5f' }}>
                        {booking.resourceName}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs" style={{ color: '#5a6a7a' }}>
                        <Clock size={11} /> {booking.bookingDate} · {booking.startTime}–{booking.endTime}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_STYLES[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Tickets widget */}
          <div
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ backgroundColor: '#ffffff', border: '1px solid #dde3ea' }}
          >
            {/* Card header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid #f0f2f5' }}
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center rounded-xl"
                  style={{ backgroundColor: '#1e3a5f', width: 36, height: 36 }}>
                  <Wrench size={16} style={{ color: '#c9a227' }} />
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1e3a5f' }}>My Support Tickets</p>
              </div>
              <Link
                to="/user/tickets"
                className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: '#c9a227' }}
              >
                View all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="px-6 py-4">
              <MyTicketsContent />
            </div>
          </div>

        </div>

        {/* Footer note */}
        <p className="text-center mt-12 text-xs tracking-widest" style={{ color: '#b0bac5' }}>
          SILVERWOOD UNIVERSITY · SMART CAMPUS OPERATIONS HUB · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
