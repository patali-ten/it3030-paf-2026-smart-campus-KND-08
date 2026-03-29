import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import OAuthCallback from './pages/auth/OAuthCallback'

// Dashboards
import UserDashboard from './pages/user/UserDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import TechnicianDashboard from './pages/technician/TechnicianDashboard'

// Shared Pages
import ProfilePage from './components/ProfilePage'
import NotificationsPage from './components/NotificationsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* USER routes */}
          <Route path="/user/dashboard" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user/notifications" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/user/profile" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* ADMIN routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* TECHNICIAN routes */}
          <Route path="/technician/dashboard" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechnicianDashboard />
            </ProtectedRoute>
          } />
          <Route path="/technician/notifications" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/technician/profile" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}