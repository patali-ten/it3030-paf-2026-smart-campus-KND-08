import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import OAuthCallback from './pages/auth/OAuthCallback'

// Booking - Member 2
import UserBookings from './pages/user/UserBookings'
import AdminBookingManager from './pages/admin/AdminBookingManager'

// Dashboards
import UserDashboard from './pages/user/UserDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import TechnicianDashboard from './pages/technician/TechnicianDashboard'

// Shared Pages
import ProfilePage from './components/ProfilePage'
import NotificationsPage from './components/NotificationsPage'

// Chatbot - Member 2 Innovation
import ChatBot from './components/ChatBot'

// Resources - Member 1
import ResourceCatalogue from './pages/user/ResourceCatalogue'
import AdminResources from './pages/admin/AdminResources'

// Tickets - Member 3
import MyTicketsPage from './pages/user/MyTicketsPage'
import AdminTicketsPage from './pages/admin/AdminTicketsPage'
import TechnicianTicketsPage from './pages/technician/TechnicianTicketsPage'

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

          {/* USER booking route - Member 2 */}
          <Route path="/user/bookings" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <UserBookings />
            </ProtectedRoute>
          } />

          {/* ✅ USER tickets route - Member 3 */}
          <Route path="/user/tickets" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <MyTicketsPage />
            </ProtectedRoute>
          } />

          {/* USER resource route - Member 1 */}
          <Route path="/user/resources" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <ResourceCatalogue />
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

          {/* ADMIN booking route - Member 2 */}
          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminBookingManager />
            </ProtectedRoute>
          } />

          {/* ✅ ADMIN tickets route - Member 3 */}
          <Route path="/admin/tickets" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminTicketsPage />
            </ProtectedRoute>
          } />

          {/* ADMIN resource route - Member 1 */}
          <Route path="/admin/resources" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminResources />
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

          {/* ✅ TECHNICIAN tickets route - Member 3 */}
          <Route path="/technician/tickets" element={
            <ProtectedRoute allowedRoles={['TECHNICIAN']}>
              <TechnicianTicketsPage />
            </ProtectedRoute>
          } />

        </Routes>

        {/* ChatBot - visible on ALL pages - Member 2 Innovation */}
        <ChatBot />

      </BrowserRouter>
    </AuthProvider>
  )
}
