import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage, RegisterPage } from './pages/auth/AuthPages'
import MerchantDashboard from './pages/merchant/DashboardPage'
import KYCFormPage from './pages/merchant/KYCFormPage'
import ReviewerQueuePage from './pages/reviewer/QueuePage'
import SubmissionDetailPage from './pages/reviewer/SubmissionDetailPage'
import AllSubmissionsPage from './pages/reviewer/AllSubmissionsPage'
import DemoPage from './pages/DemoPage'
import PlaytoPayPage from './pages/PlaytoPayPage'

function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'reviewer' ? '/reviewer/queue' : '/dashboard'} replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<DemoPage />} />
      <Route path="/pay"      element={<PlaytoPayPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Merchant */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="merchant"><MerchantDashboard /></ProtectedRoute>
      } />
      <Route path="/kyc" element={
        <ProtectedRoute requiredRole="merchant"><KYCFormPage /></ProtectedRoute>
      } />

      {/* Reviewer */}
      <Route path="/reviewer/queue" element={
        <ProtectedRoute requiredRole="reviewer"><ReviewerQueuePage /></ProtectedRoute>
      } />
      <Route path="/reviewer/submissions" element={
        <ProtectedRoute requiredRole="reviewer"><AllSubmissionsPage /></ProtectedRoute>
      } />
      <Route path="/reviewer/submissions/:id" element={
        <ProtectedRoute requiredRole="reviewer"><SubmissionDetailPage /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

