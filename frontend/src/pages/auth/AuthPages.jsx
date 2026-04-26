import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ShieldCheck, Eye, EyeOff, ArrowRight, Loader2, Mail, KeyRound, ArrowLeft } from 'lucide-react'
import api from '../../api/client'

function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-void flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-2/5 sidebar-glass flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg">
            <ShieldCheck size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-none">Playto Pay</p>
            <p className="text-white/40 text-xs font-body mt-0.5">International Payments</p>
          </div>
        </div>

        <div>
          <h2 className="font-display font-bold text-white text-3xl leading-tight mb-4">
            Start collecting international payments in days,<br />
            <span className="text-brand-400">not months.</span>
          </h2>
          <div className="space-y-3 mt-8">
            {['Trusted by 2,000+ Indian agencies', 'KYC approval in under 48 hours', 'Multi-currency payouts'].map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-white/60 text-sm font-body">
                <span className="w-4 h-4 rounded-full bg-brand-600/30 flex items-center justify-center text-brand-400 text-[10px]">✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs font-body">© 2025 Playto Pay Technologies Pvt Ltd</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-brand-300 flex items-center justify-center">
              <ShieldCheck size={17} className="text-black" strokeWidth={2.5} />
            </div>
            <p className="font-display font-bold text-white text-lg">Playto Pay</p>
          </div>
          <h1 className="font-display font-bold text-white text-4xl tracking-tight mb-2">{title}</h1>
          <p className="text-white/50 font-body text-sm mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

function PasswordField({ value, onChange, placeholder = 'Password', id = 'password' }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field pr-11"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

function ErrorBox({ message }) {
  if (!message) return null
  return (
    <div className="px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body animate-fade-in shadow-lg">
      {message}
    </div>
  )
}

function SuccessBox({ message }) {
  if (!message) return null
  return (
    <div className="px-5 py-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-body animate-fade-in shadow-lg">
      {message}
    </div>
  )
}

// ─── LOGIN ──────────────────────────────────────────────────
export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]   = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      // If email not verified, redirect to OTP page
      if (!user.is_email_verified && user.role === 'merchant') {
        navigate('/verify-otp', { replace: true })
      } else {
        navigate(user.role === 'reviewer' ? '/reviewer/queue' : '/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Playto account">
      <form onSubmit={handle} className="space-y-5">
        <ErrorBox message={error} />

        <div>
          <label className="label" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder="your_username"
            className="input-field"
            autoFocus
          />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <PasswordField
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-brand-300 text-xs font-body hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading && <ArrowRight size={16} strokeWidth={2.5} />}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-body text-white/50">
        New merchant?{' '}
        <Link to="/register" className="text-brand-300 font-bold hover:underline">
          Create account
        </Link>
      </p>

      <div className="mt-10 pt-8 border-t border-white/5">
        <p className="text-xs text-white/30 font-display font-bold uppercase tracking-widest mb-4 text-center">Quick demo access</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Merchant (draft)', u: 'merchant1' },
            { label: 'Reviewer',        u: 'reviewer1' },
          ].map(({ label, u }) => (
            <button
              key={u}
              type="button"
              onClick={() => setForm({ username: u, password: 'password123' })}
              className="px-4 py-3 rounded-xl bg-white/5 hover:bg-brand-300/10 border border-white/5 hover:border-brand-300/30 text-xs font-body text-left transition-colors group"
            >
              <span className="font-display font-bold text-white group-hover:text-brand-300 block mb-1">{label}</span>
              <span className="text-white/40 group-hover:text-brand-300/70">{u}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  )
}

// ─── REGISTER ───────────────────────────────────────────────
export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ ...form, role: 'merchant' })
      // After registration, OTP is auto-sent — redirect to verification
      navigate('/verify-otp', { replace: true })
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail && typeof detail === 'object') {
        const msgs = Object.entries(detail).map(([k, v]) =>
          `${k}: ${Array.isArray(v) ? v.join(' ') : v}`
        ).join(' · ')
        setError(msgs)
      } else {
        setError(err.response?.data?.message || 'Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Create account" subtitle="Join Playto and start collecting international payments">
      <form onSubmit={handle} className="space-y-5">
        <ErrorBox message={error} />

        <div>
          <label className="label" htmlFor="reg-username">Username</label>
          <input id="reg-username" type="text" value={form.username} onChange={set('username')} placeholder="johndoe" className="input-field" autoFocus />
        </div>

        <div>
          <label className="label" htmlFor="reg-email">Email address</label>
          <input id="reg-email" type="email" value={form.email} onChange={set('email')} placeholder="john@agency.com" className="input-field" />
        </div>

        <div>
          <label className="label" htmlFor="reg-phone">Phone number</label>
          <input id="reg-phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className="input-field" />
        </div>

        <div>
          <label className="label" htmlFor="reg-password">Password</label>
          <PasswordField id="reg-password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-4">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Creating account…' : 'Create account'}
          {!loading && <ArrowRight size={16} strokeWidth={2.5} />}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-body text-white/50">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-300 font-bold hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}

// ─── OTP VERIFICATION ───────────────────────────────────────
export function VerifyOTPPage() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const inputs = useRef([])

  useEffect(() => {
    if (!token) navigate('/login', { replace: true })
  }, [token, navigate])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // only digits
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // only last digit
    setOtp(newOtp)
    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputs.current[5]?.focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/verify-otp/', { otp: code })
      setSuccess('Email verified! Redirecting...')
      // Update user in localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      storedUser.is_email_verified = true
      localStorage.setItem('user', JSON.stringify(storedUser))
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    try {
      await api.post('/auth/request-otp/')
      setSuccess('New OTP sent to your email!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthShell title="Verify your email" subtitle={`Enter the 6-digit code sent to ${user?.email || 'your email'}`}>
      <form onSubmit={handleVerify} className="space-y-6">
        <ErrorBox message={error} />
        <SuccessBox message={success} />

        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-600/20 flex items-center justify-center">
            <Mail size={28} className="text-brand-400" />
          </div>
        </div>

        {/* 6-digit OTP input */}
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-display font-bold rounded-xl bg-white/5 border border-white/10 text-white
                         focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none transition-all"
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          {loading ? 'Verifying…' : 'Verify Email'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-white/40 text-sm font-body mb-2">Didn't receive the code?</p>
        <button
          onClick={handleResend}
          disabled={resending}
          className="text-brand-300 font-bold text-sm hover:underline disabled:opacity-50"
        >
          {resending ? 'Sending…' : 'Resend OTP'}
        </button>
      </div>
    </AuthShell>
  )
}

// ─── FORGOT PASSWORD ────────────────────────────────────────
export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Email is required.'); return }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password/', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle="We've sent a verification code to reset your password">
        <SuccessBox message={`If ${email} is registered, an OTP has been sent.`} />

        <div className="flex items-center justify-center my-8">
          <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
            <Mail size={28} className="text-green-400" />
          </div>
        </div>

        <button
          onClick={() => navigate('/reset-password', { state: { email } })}
          className="btn-primary w-full justify-center"
        >
          Enter OTP & Reset Password
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>

        <p className="mt-6 text-center text-sm font-body text-white/50">
          <Link to="/login" className="text-brand-300 font-bold hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Forgot password?" subtitle="Enter your email and we'll send a reset code">
      <form onSubmit={handle} className="space-y-5">
        <ErrorBox message={error} />

        <div>
          <label className="label" htmlFor="forgot-email">Email address</label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="john@agency.com"
            className="input-field"
            autoFocus
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-4">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
          {loading ? 'Sending…' : 'Send Reset Code'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-body text-white/50">
        Remember your password?{' '}
        <Link to="/login" className="text-brand-300 font-bold hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  )
}

// ─── RESET PASSWORD ─────────────────────────────────────────
export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', otp: '', new_password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Pre-fill email from navigation state
  useEffect(() => {
    const state = window.history.state?.usr
    if (state?.email) {
      setForm(f => ({ ...f, email: state.email }))
    }
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handle = async (e) => {
    e.preventDefault()
    if (!form.email || !form.otp || !form.new_password) {
      setError('All fields are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/reset-password/', form)
      setSuccess(data.detail || 'Password reset! Redirecting to login...')
      setTimeout(() => navigate('/login', { replace: true }), 2500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Reset password" subtitle="Enter the OTP from your email and choose a new password">
      <form onSubmit={handle} className="space-y-5">
        <ErrorBox message={error} />
        <SuccessBox message={success} />

        <div>
          <label className="label" htmlFor="reset-email">Email address</label>
          <input id="reset-email" type="email" value={form.email} onChange={set('email')} placeholder="john@agency.com" className="input-field" />
        </div>

        <div>
          <label className="label" htmlFor="reset-otp">6-digit OTP</label>
          <input id="reset-otp" type="text" inputMode="numeric" maxLength={6} value={form.otp} onChange={set('otp')} placeholder="123456" className="input-field tracking-[0.5em] text-center font-display font-bold text-lg" />
        </div>

        <div>
          <label className="label" htmlFor="reset-password">New password</label>
          <PasswordField id="reset-password" value={form.new_password} onChange={set('new_password')} placeholder="Min 6 characters" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-4">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          {loading ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-body text-white/50">
        <Link to="/login" className="text-brand-300 font-bold hover:underline inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back to login
        </Link>
      </p>
    </AuthShell>
  )
}
