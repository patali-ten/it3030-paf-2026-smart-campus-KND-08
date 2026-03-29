import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function OAuthCallback() {
  const [params] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  const DASHBOARD_ROUTES = {
    ADMIN: '/admin/dashboard',
    USER: '/user/dashboard',
    TECHNICIAN: '/technician/dashboard',
  }

  useEffect(() => {
    const token = params.get('token')
    const role = params.get('role')
    const userId = params.get('userId')
    const name = params.get('name')

    if (token && role) {
      login({ token, role, userId: Number(userId), name, email: '' })
      toast.success(`Welcome, ${name}!`)
      navigate(DASHBOARD_ROUTES[role] || '/user/dashboard')
    } else {
      toast.error('Google login failed')
      navigate('/login')
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Completing sign in...</p>
      </div>
    </div>
  )
}