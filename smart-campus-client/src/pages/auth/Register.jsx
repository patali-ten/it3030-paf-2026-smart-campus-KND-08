import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { registerUser } from '../../api/auth'
import { Building2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  // ✅ Frontend validation — mirrors backend rules exactly
  const validate = () => {
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*[0-9])(?=.*[@_$#!%^&*])[A-Za-z0-9@_$#!%^&*]+$/

    if (!form.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (form.name.trim().length > 50) {
      newErrors.name = 'Name must not exceed 50 characters'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Enter a valid email address (e.g. user@example.com)'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters'
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password = 'Password must contain at least one number and one special character (@, _, $, #, !, %, ^, &, *)'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ✅ Run validation before API call
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    setLoading(true)
    try {
      const res = await registerUser(form)
      login(res.data)
      toast.success('Account created! Welcome.')
      navigate('/user/dashboard')
    } catch (err) {
      // ✅ Handle backend field-level errors
      const backendErrors = err.response?.data?.errors
      if (backendErrors) {
        setErrors(backendErrors)
      } else {
        toast.error(err.response?.data?.error || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="text-white font-bold">SilverWood University</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={form.name}
                onChange={e => {
                  setForm({ ...form, name: e.target.value })
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
                }}
                placeholder="John Doe"
                className={`w-full bg-slate-900 border text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors placeholder:text-slate-600
                  ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-indigo-500'}`}
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={form.email}
                onChange={e => {
                  setForm({ ...form, email: e.target.value })
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
                }}
                placeholder="you@campus.lk"
                className={`w-full bg-slate-900 border text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors placeholder:text-slate-600
                  ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-indigo-500'}`}
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => {
                  setForm({ ...form, password: e.target.value })
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                }}
                placeholder="••••••••"
                className={`w-full bg-slate-900 border text-white rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none transition-colors placeholder:text-slate-600
                  ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-700 focus:border-indigo-500'}`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            {/* ✅ Password hint shown always so user knows the rules upfront */}
            {!errors.password && (
              <p className="text-slate-600 text-xs mt-1">
                Min 3 chars, must include a number and a special character (@, _, $, #...)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold transition-colors mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-slate-500 text-sm text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}