import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginPage, RegisterPage, VerifyOTPPage, ForgotPasswordPage, ResetPasswordPage } from './pages/auth/AuthPages'
import MerchantDashboard from './pages/merchant/DashboardPage'
import KYCFormPage from './pages/merchant/KYCFormPage'
import ReviewerQueuePage from './pages/reviewer/QueuePage'
import SubmissionDetailPage from './pages/reviewer/SubmissionDetailPage'
import AllSubmissionsPage from './pages/reviewer/AllSubmissionsPage'
import DemoPage from './pages/DemoPage'
import PlaytoPayPage from './pages/PlaytoPayPage'
import AutoDMPage from './pages/AutoDMPage'

function ProtectedRoute({ children, requiredRole }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />

  // If merchant hasn't verified email, force them to verify
  if (user?.role === 'merchant' && !user?.is_email_verified) {
    return <Navigate to="/verify-otp" replace />
  }

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
      <Route path="/autodm"   element={<AutoDMPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />

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
