import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { registerUser } from '../../api/auth'
import { Mail, Lock, User, Eye, EyeOff, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import campusImg from '../../assets/campus.jpg'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*[0-9])(?=.*[@_$#!%^&*])[A-Za-z0-9@_$#!%^&*]+$/
    if (!form.name.trim()) e.name = 'Name is required'
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!emailRegex.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 3) e.password = 'Password must be at least 3 characters'
    else if (!passwordRegex.test(form.password)) e.password = 'Must contain at least one number and one special character'
    return e
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await registerUser(form)
      login(res.data)
      toast.success('Welcome to SilverWood University!')
      navigate('/user/dashboard')
    } catch (err) {
      const be = err.response?.data?.errors
      if (be) setErrors(be)
      else toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  const inputStyle = (field) => ({
    background: 'white',
    border: `1.5px solid ${errors[field] ? '#dc2626' : 'var(--border)'}`,
    color: 'var(--text)',
  })

  const handleFocus = (e, field) => { if (!errors[field]) e.target.style.borderColor = 'var(--gold)' }
  const handleBlur  = (e, field) => { if (!errors[field]) e.target.style.borderColor = 'var(--border)' }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--navy-dark)' }}>

      {/* Left — photo strip (narrower on register) */}
      <div className="hidden lg:flex w-2/5 relative overflow-hidden flex-col justify-end">
        <img src={campusImg} alt="Campus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, rgba(17,29,51,0.85), rgba(27,42,74,0.7))' }} />
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gold)' }}>
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold leading-none">SilverWood</p>
              <p style={{ color: 'var(--gold-light)', fontSize: '10px' }} className="uppercase tracking-widest">University</p>
            </div>
          </div>
          <p className="font-display text-2xl text-white leading-snug mb-2">
            Join the<br /><span style={{ color: 'var(--gold-light)' }}>Smart Campus</span>
          </p>
          <p className="text-white/50 text-sm">
            Create your account to start booking facilities and managing campus resources.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'var(--surface)' }}>
        <div className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gold)' }}>
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="font-semibold text-lg" style={{ color: 'var(--navy)' }}>SilverWood University</span>
          </div>

          <h2 className="font-display text-3xl mb-1" style={{ color: 'var(--navy)' }}>Create account</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Register as a Campus User. Admins & Technicians are assigned by administration.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text" value={form.name}
                  onChange={e => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors(p => ({ ...p, name: '' })) }}
                  placeholder="Full Name"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={inputStyle('name')}
                  onFocus={e => handleFocus(e, 'name')} onBlur={e => handleBlur(e, 'name')}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="email" value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors(p => ({ ...p, email: '' })) }}
                  placeholder="you@silverwood.edu"
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                  style={inputStyle('email')}
                  onFocus={e => handleFocus(e, 'email')} onBlur={e => handleBlur(e, 'email')}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => { setForm({ ...form, password: e.target.value }); if (errors.password) setErrors(p => ({ ...p, password: '' })) }}
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-10 pr-10 py-3 text-sm outline-none transition-all"
                  style={inputStyle('password')}
                  onFocus={e => handleFocus(e, 'password')} onBlur={e => handleBlur(e, 'password')}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password
                ? <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                : <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Min 3 chars · include a number and special character (@, _, $, #…)</p>
              }
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ background: 'var(--navy)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:opacity-80" style={{ color: 'var(--gold-dim)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}