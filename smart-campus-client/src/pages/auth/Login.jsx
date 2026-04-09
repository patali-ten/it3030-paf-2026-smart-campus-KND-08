import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginUser } from '../../api/auth'
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import campusImg from '../../assets/campus.jpg'

const DASHBOARD_ROUTES = {
  ADMIN: '/admin/dashboard',
  USER: '/user/dashboard',
  TECHNICIAN: '/technician/dashboard',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!emailRegex.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 3) e.password = 'Password must be at least 3 characters'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await loginUser(form)
      login(res.data)
      toast.success(`Welcome back, ${res.data.name}!`)
      navigate(DASHBOARD_ROUTES[res.data.role] || '/user/dashboard')
    } catch (err) {
      const be = err.response?.data?.errors
      if (be) setErrors(be)
      else toast.error(err.response?.data?.error || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  const handleGoogle = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--navy-dark)' }}>

      {/* ── Left Panel — Campus Photo Hero ── */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden flex-col justify-between">

        {/* Photo */}
        <img
          src={campusImg}
          alt="SilverWood University Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlays — navy tint + bottom fade */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(17,29,51,0.82) 0%, rgba(27,42,74,0.65) 50%, rgba(17,29,51,0.75) 100%)',
          }}
        />
        {/* Bottom fade for text legibility */}
        <div
          className="absolute bottom-0 left-0 right-0 h-64"
          style={{ background: 'linear-gradient(to top, rgba(17,29,51,0.95), transparent)' }}
        />

        {/* Top — Logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gold)' }}
            >
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg leading-none">SilverWood</p>
              <p style={{ color: 'var(--gold-light)', fontSize: '11px' }} className="uppercase tracking-widest">University</p>
            </div>
          </div>
        </div>

        {/* Bottom — Quote over photo */}
        <div className="relative z-10 p-10">
          <p
            className="font-display text-4xl leading-snug text-white mb-4"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            One platform.<br />
            <span style={{ color: 'var(--gold-light)' }}>Every resource.</span><br />
            Always ready.
          </p>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Book lecture halls, labs & equipment · Report maintenance issues<br />
            Track tickets · Stay notified in real time
          </p>
          <div className="flex gap-2 flex-wrap">
            {['Facilities', 'Bookings', 'Tickets', 'Notifications'].map(label => (
              <span
                key={label}
                className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{
                  background: 'rgba(201,168,76,0.15)',
                  border: '1px solid rgba(201,168,76,0.35)',
                  color: 'var(--gold-light)',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: 'var(--surface)' }}
      >
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gold)' }}>
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-semibold text-lg" style={{ color: 'var(--navy)' }}>SilverWood University</span>
          </div>

          <h2 className="font-display text-3xl mb-1" style={{ color: 'var(--navy)' }}>Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Sign in to access the Smart Campus Operations Hub
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm mb-5 transition-all hover:shadow-md"
            style={{
              background: 'white',
              border: '1.5px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors(p => ({ ...p, email: '' })) }}
                  placeholder="you@silverwood.edu"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm transition-all outline-none"
                  style={{
                    background: 'white',
                    border: `1.5px solid ${errors.email ? '#dc2626' : 'var(--border)'}`,
                    color: 'var(--text)',
                  }}
                  onFocus={e => !errors.email && (e.target.style.borderColor = 'var(--gold)')}
                  onBlur={e => !errors.email && (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); if (errors.password) setErrors(p => ({ ...p, password: '' })) }}
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-10 pr-10 py-3 text-sm transition-all outline-none"
                  style={{
                    background: 'white',
                    border: `1.5px solid ${errors.password ? '#dc2626' : 'var(--border)'}`,
                    color: 'var(--text)',
                  }}
                  onFocus={e => !errors.password && (e.target.style.borderColor = 'var(--gold)')}
                  onBlur={e => !errors.password && (e.target.style.borderColor = 'var(--border)')}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ background: 'var(--navy)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold transition-colors hover:opacity-80" style={{ color: 'var(--gold-dim)' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}