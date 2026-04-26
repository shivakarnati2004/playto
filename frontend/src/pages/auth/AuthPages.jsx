import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ShieldCheck, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

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
      navigate(user.role === 'reviewer' ? '/reviewer/queue' : '/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Playto account">
      <form onSubmit={handle} className="space-y-5">
        {error && (
          <div className="px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body animate-fade-in shadow-lg">
            {error}
          </div>
        )}

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

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-4">
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
      navigate('/dashboard', { replace: true })
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
        {error && (
          <div className="px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body animate-fade-in shadow-lg">
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="reg-username">Username</label>
          <input id="reg-username" type="text" value={form.username} onChange={set('username')} placeholder="johndoe" className="input-field" />
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
