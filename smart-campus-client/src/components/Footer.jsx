import { Link, useLocation } from 'react-router-dom'
import { GraduationCap, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

// Hide footer on auth pages
const AUTH_PATHS = ['/login', '/register', '/oauth-callback']

export default function Footer() {
  const location = useLocation()
  if (AUTH_PATHS.includes(location.pathname)) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Lato:wght@300;400;700&display=swap');
        .sw-footer * { font-family: 'Lato', sans-serif; }
        .sw-footer-serif { font-family: 'Playfair Display', serif; }
        .sw-footer-link { color: rgba(255,255,255,0.45); font-size: 13px; text-decoration: none; transition: color 0.2s; display: block; margin-bottom: 8px; }
        .sw-footer-link:hover { color: #C9A84C; }
        .sw-footer-divider { width: 100%; height: 1px; background: rgba(201,168,76,0.15); margin: 0; }
      `}</style>

      <footer className="sw-footer" style={{ background: '#0d1829', borderTop: '1px solid rgba(201,168,76,0.18)' }}>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            {/* Brand Column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#C9A84C' }}>
                  <GraduationCap size={20} className="text-white" />
                </div>
                <div>
                  <p className="sw-footer-serif font-semibold text-white text-lg leading-none">SilverWood</p>
                  <p className="text-xs uppercase tracking-widest mt-0.5" style={{ color: '#C9A84C', fontSize: 9 }}>University</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Smart Campus Operations Hub. One platform for every resource, always ready.
              </p>
              {/* Gold accent line */}
              <div style={{ width: 40, height: 2, background: '#C9A84C', borderRadius: 2 }} />
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-xs font-bold tracking-widest mb-5" style={{ color: '#C9A84C' }}>NAVIGATION</p>
              <a href="/user/dashboard" className="sw-footer-link">Dashboard</a>
              <a href="/user/resources" className="sw-footer-link">Browse Facilities</a>
              <a href="/user/bookings" className="sw-footer-link">My Bookings</a>
              <a href="/user/tickets" className="sw-footer-link">Support Tickets</a>
              <a href="/user/notifications" className="sw-footer-link">Notifications</a>
            </div>

            {/* Resources */}
            <div>
              <p className="text-xs font-bold tracking-widest mb-5" style={{ color: '#C9A84C' }}>RESOURCES</p>
              <a href="#" className="sw-footer-link">Booking Policy</a>
              <a href="#" className="sw-footer-link">Facilities Guide</a>
              <a href="#" className="sw-footer-link">IT Support</a>
              <a href="#" className="sw-footer-link">Campus Map</a>
              <a href="#" className="sw-footer-link flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Student Portal <ExternalLink size={11} />
              </a>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-bold tracking-widest mb-5" style={{ color: '#C9A84C' }}>CONTACT</p>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    123 University Ave,<br />Campus District
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={13} className="flex-shrink-0" style={{ color: '#C9A84C' }} />
                  <a href="mailto:support@silverwood.edu" className="text-sm transition"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                    onMouseEnter={e => e.target.style.color = '#C9A84C'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>
                    support@silverwood.edu
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={13} className="flex-shrink-0" style={{ color: '#C9A84C' }} />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="sw-footer-divider" />
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>
            © {new Date().getFullYear()} SILVERWOOD UNIVERSITY · SMART CAMPUS OPERATIONS HUB
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs transition" style={{ color: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => e.target.style.color = '#C9A84C'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.25)'}>Privacy Policy</a>
            <a href="#" className="text-xs transition" style={{ color: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => e.target.style.color = '#C9A84C'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.25)'}>Terms of Use</a>
          </div>
        </div>

      </footer>
    </>
  )
}
