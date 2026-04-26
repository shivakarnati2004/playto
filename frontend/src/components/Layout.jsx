import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FileText, Users, LogOut,
  ShieldCheck, Bell, ClipboardList
} from 'lucide-react'

function NavItem({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
      }
    >
      <Icon size={18} strokeWidth={2.5} />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const merchantNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/kyc',       icon: FileText,         label: 'KYC Application' },
  ]

  const reviewerNav = [
    { to: '/reviewer/queue',       icon: ClipboardList,  label: 'Review Queue' },
    { to: '/reviewer/submissions', icon: Users,           label: 'All Submissions' },
  ]

  const navItems = user?.role === 'reviewer' ? reviewerNav : merchantNav

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      {/* Sidebar */}
      <aside className="sidebar-glass w-64 flex-shrink-0 flex flex-col">
        {/* Logo */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-300 flex items-center justify-center shadow-[0_0_20px_rgba(253,224,71,0.3)]">
              <ShieldCheck size={20} className="text-black" strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-display font-bold text-white text-xl leading-none tracking-tight">Playto</p>
              <p className="text-white/40 text-[10px] font-display font-bold uppercase tracking-widest mt-1">KYC Portal</p>
            </div>
          </div>
        </div>

        {/* Role tag */}
        <div className="px-6 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-display font-bold uppercase tracking-widest">
            {user?.role === 'reviewer' ? '🔍 Reviewer' : '🏢 Merchant'}
          </span>
        </div>

        {/* Nav */}
        <nav className="px-4 flex-1 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* User footer */}
        <div className="px-5 pb-6 pt-5 border-t border-white/10">
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-display font-bold text-sm">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-display font-bold truncate">{user?.username}</p>
              <p className="text-white/40 text-[11px] font-body truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-item-inactive w-full text-red-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={18} strokeWidth={2.5} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-void relative">
        <div className="animate-fade-in relative z-10 min-h-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  )
}
