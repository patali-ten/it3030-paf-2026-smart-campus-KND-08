import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import { CalendarCheck, Wrench, Bell, ArrowRight, Building2, Clock, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMyBookings } from '../../api/bookings'
import { MyTicketsContent } from './MyTicketsPage'

// ── Monash building image (image 2 provided by user) ──────────────────────────
const CAMPUS_IMG = '/src/assets/campus_building.jpg'
// Replace the path above with the actual path you store the Monash building image.
// e.g. import campusImg from '../../assets/campus_building.jpg'  then use campusImg below.

const QUICK_ACTIONS = [
  {
    label: 'Browse Facilities',
    desc: 'Rooms, labs & equipment catalogue',
    href: '/user/resources',
    icon: Building2,
    accent: '#C9A84C',
    num: '01',
  },
  {
    label: 'Book a Resource',
    desc: 'Reserve rooms, labs & equipment',
    href: '/user/bookings',
    icon: CalendarCheck,
    accent: '#1B2A4A',
    num: '02',
  },
  {
    label: 'Report an Issue',
    desc: 'Submit a maintenance ticket',
    href: '/user/tickets',
    icon: Wrench,
    accent: '#C9A84C',
    num: '03',
  },
  {
    label: 'Notifications',
    desc: 'Check your latest updates',
    href: '/user/notifications',
    icon: Bell,
    accent: '#1B2A4A',
    num: '04',
  },
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
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .sw-dash * { font-family: 'Lato', sans-serif; }
        .sw-serif { font-family: 'Playfair Display', serif; }
        .action-card:hover .action-arrow { transform: translateX(4px); opacity: 1; }
        .action-card:hover { box-shadow: 0 20px 40px rgba(27,42,74,0.15); }
        .booking-row:hover { background: #f8f7f4; }
      `}</style>

      <div className="sw-dash min-h-screen" style={{ background: '#F5F4EF' }}>
        <Navbar />

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ height: 340, marginTop: 64 }}>
          {/* Campus photo — replace src with actual imported asset */}
          <img
            src={CAMPUS_IMG}
            alt="SilverWood Campus"
            className="w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.55)' }}
            onError={e => {
              // fallback gradient if image missing
              e.target.style.display = 'none'
            }}
          />
          {/* Fallback gradient shown always (behind image) */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #1B2A4A 0%, #243660 60%, #1a3a2a 100%)',
              zIndex: -1,
            }}
          />
          {/* Gold diagonal accent */}
          <div
            className="absolute bottom-0 right-0"
            style={{
              width: 320,
              height: 320,
              background: 'linear-gradient(135deg, transparent 50%, rgba(201,168,76,0.25) 50%)',
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-end px-10 pb-10"
            style={{ background: 'linear-gradient(to top, rgba(27,42,74,0.85) 0%, transparent 60%)' }}>
            <p className="sw-serif text-4xl font-bold text-white mb-1">
              Hello, <span style={{ color: '#C9A84C' }}>{user?.name?.split(' ')[0]}</span> 👋
            </p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, letterSpacing: '0.04em' }}>
              SILVERWOOD UNIVERSITY · SMART CAMPUS HUB
            </p>
          </div>
        </div>

        {/* ── Main Content ────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* Quick Actions */}
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 32, height: 2, background: '#C9A84C' }} />
            <p className="sw-serif text-lg font-semibold" style={{ color: '#1B2A4A' }}>Quick Actions</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {QUICK_ACTIONS.map(({ label, desc, href, icon: Icon, num }) => (
              <Link
                key={href}
                to={href}
                className="action-card relative block rounded-2xl p-6 transition-all duration-300"
                style={{
                  background: '#fff',
                  border: '1px solid #e8e4d9',
                  boxShadow: '0 2px 12px rgba(27,42,74,0.06)',
                }}
              >
                <p className="sw-serif text-5xl font-bold mb-4 select-none"
                  style={{ color: '#1B2A4A', opacity: 0.07, lineHeight: 1 }}>{num}</p>
                <div
                  className="inline-flex items-center justify-center rounded-xl mb-4"
                  style={{ background: '#1B2A4A', width: 44, height: 44 }}
                >
                  <Icon size={20} style={{ color: '#C9A84C' }} />
                </div>
                <p className="font-bold text-sm mb-1" style={{ color: '#1B2A4A' }}>{label}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#8a8375' }}>{desc}</p>
                <ArrowRight
                  size={16}
                  className="action-arrow absolute bottom-5 right-5 transition-all duration-200"
                  style={{ color: '#C9A84C', opacity: 0.5 }}
                />
              </Link>
            ))}
          </div>

          {/* Two-column widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Bookings */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: '#fff', border: '1px solid #e8e4d9', boxShadow: '0 2px 12px rgba(27,42,74,0.06)' }}>
              <div className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: '1px solid #f0ede6' }}>
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center rounded-lg"
                    style={{ background: '#1B2A4A', width: 36, height: 36 }}>
                    <CalendarCheck size={16} style={{ color: '#C9A84C' }} />
                  </div>
                  <p className="sw-serif font-semibold" style={{ color: '#1B2A4A' }}>My Recent Bookings</p>
                </div>
                <Link to="/user/bookings"
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: '#C9A84C' }}>
                  View all <ChevronRight size={14} />
                </Link>
              </div>

              {recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                  <div className="rounded-full mb-4 flex items-center justify-center"
                    style={{ width: 56, height: 56, background: '#f0ede6' }}>
                    <CalendarCheck size={24} style={{ color: '#C9A84C' }} />
                  </div>
                  <p className="font-semibold text-sm mb-1" style={{ color: '#1B2A4A' }}>No bookings yet</p>
                  <p className="text-xs mb-4" style={{ color: '#8a8375' }}>Reserve your first space on campus</p>
                  <Link to="/user/bookings"
                    className="text-xs font-bold px-4 py-2 rounded-lg transition"
                    style={{ background: '#1B2A4A', color: '#C9A84C' }}>
                    Book Now
                  </Link>
                </div>
              ) : (
                <div>
                  {recentBookings.map((booking, i) => (
                    <div
                      key={booking.id}
                      className="booking-row flex items-center justify-between px-6 py-4 transition"
                      style={{ borderBottom: i < recentBookings.length - 1 ? '1px solid #f0ede6' : 'none' }}
                    >
                      <div>
                        <p className="font-semibold text-sm mb-0.5" style={{ color: '#1B2A4A' }}>
                          {booking.resourceName}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs" style={{ color: '#8a8375' }}>
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
            <div className="rounded-2xl overflow-hidden"
              style={{ background: '#fff', border: '1px solid #e8e4d9', boxShadow: '0 2px 12px rgba(27,42,74,0.06)' }}>
              <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid #f0ede6' }}>
                <div className="inline-flex items-center justify-center rounded-lg"
                  style={{ background: '#1B2A4A', width: 36, height: 36 }}>
                  <Wrench size={16} style={{ color: '#C9A84C' }} />
                </div>
                <p className="sw-serif font-semibold" style={{ color: '#1B2A4A' }}>My Support Tickets</p>
              </div>
              <div className="px-6 py-4">
                <MyTicketsContent />
              </div>
            </div>

          </div>

          {/* Footer note */}
          <p className="text-center mt-12 text-xs" style={{ color: '#b5b0a4', letterSpacing: '0.06em' }}>
            SILVERWOOD UNIVERSITY · SMART CAMPUS OPERATIONS HUB · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  )
}
