import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import api from '../../api/client'
import {
  ArrowRight, FileText, CheckCircle2, Clock, AlertCircle,
  Bell, ChevronRight, Loader2
} from 'lucide-react'

const STATUS_MESSAGES = {
  draft:               { icon: FileText, color: 'text-gray-400',    title: 'Application in progress', desc: 'Complete all steps and submit your KYC to start collecting payments.' },
  submitted:           { icon: Clock,    color: 'text-blue-500',    title: 'Under review', desc: 'Your application is in the queue. Our team reviews submissions within 48 hours.' },
  under_review:        { icon: Clock,    color: 'text-amber-500',   title: 'Being reviewed', desc: 'A reviewer is actively going through your application right now.' },
  approved:            { icon: CheckCircle2, color: 'text-emerald-500', title: 'Approved — You\'re live!', desc: 'Your KYC is approved. You can now collect international payments through Playto.' },
  rejected:            { icon: AlertCircle, color: 'text-red-500',  title: 'Application rejected', desc: 'Your application was not approved. Review the feedback below.' },
  more_info_requested: { icon: AlertCircle, color: 'text-orange-500', title: 'More information needed', desc: 'The reviewer needs additional information. Please update your application.' },
}

function StatCard({ label, value, sub, highlight = false }) {
  return (
    <div className={`card p-6 ${highlight ? 'border-brand-300/30 bg-white/15' : ''}`}>
      <p className="label">{label}</p>
      <p className={`font-display font-bold text-4xl ${highlight ? 'text-brand-300' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs font-body text-white/40 mt-2">{sub}</p>}
    </div>
  )
}

export default function MerchantDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/kyc/submission/'),
      api.get('/kyc/notifications/'),
    ]).then(([subRes, notifRes]) => {
      setSubmission(subRes.data)
      setNotifications(notifRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 size={28} className="animate-spin text-brand-600" />
        </div>
      </Layout>
    )
  }

  const status = submission?.status || 'draft'
  const StatusInfo = STATUS_MESSAGES[status] || STATUS_MESSAGES.draft
  const StatusIcon = StatusInfo.icon

  const docCount = submission?.documents?.length || 0
  const steps = [
    { label: 'Personal Details', done: !!submission?.full_name },
    { label: 'Business Details', done: !!submission?.business_name },
    { label: 'Documents',        done: docCount >= 3 },
  ]
  const completedSteps = steps.filter(s => s.done).length

  return (
    <Layout>
      <div className="animate-slide-up pb-10">
        {/* Liquid Header */}
        <div className="bg-brand-300 px-10 pt-16 pb-20 liquid-section mb-12 shadow-[0_20px_50px_rgba(253,224,71,0.15)] relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none liquid-section" />
          <div className="max-w-4xl relative z-10">
            <p className="text-black/60 font-display font-bold text-xs uppercase tracking-widest mb-4">Dashboard Overview</p>
            <h1 className="font-display font-bold text-black text-6xl md:text-7xl tracking-tight leading-[0.9]">
              Welcome back,<br/>{submission?.full_name || user?.username}
            </h1>
          </div>
        </div>

        <div className="px-10 max-w-4xl mx-auto space-y-8">

        {/* Status card */}
        <div className={`card p-8 ${status === 'approved' ? 'border-emerald-500/30' : status === 'rejected' ? 'border-red-500/30' : ''}`}>
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className={`w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <StatusIcon size={24} className={StatusInfo.color} />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="font-display font-bold text-white text-2xl tracking-tight">{StatusInfo.title}</h2>
                  <StatusBadge status={status} />
                </div>
                <p className="text-white/60 font-body text-sm max-w-lg leading-relaxed">{StatusInfo.desc}</p>
                {(status === 'rejected' || status === 'more_info_requested') && submission?.reviewer_notes && (
                  <div className="mt-5 px-5 py-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 backdrop-blur-md">
                    <p className="text-[10px] font-display font-bold text-orange-400 uppercase tracking-widest mb-1.5">Reviewer Note</p>
                    <p className="text-sm font-body text-white/90">{submission.reviewer_notes}</p>
                  </div>
                )}
              </div>
            </div>
            {(status === 'draft' || status === 'more_info_requested') && (
              <button onClick={() => navigate('/kyc')} className="btn-primary flex-shrink-0">
                {status === 'more_info_requested' ? 'Update & Resubmit' : 'Continue KYC'}
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Progress + stats */}
        <div className="grid grid-cols-3 gap-6">
          <StatCard label="Application Progress" value={`${completedSteps}/3`} sub="steps completed" />
          <StatCard label="Documents Uploaded" value={docCount} sub="of 3 required" />
          <StatCard label="KYC Status" value={status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} highlight={true} />
        </div>

        {/* Steps checklist */}
        <div className="card p-8">
          <h3 className="label">Application Checklist</h3>
          <div className="space-y-4 mt-6">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner ${step.done ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5 border border-white/10'}`}>
                  {step.done
                    ? <CheckCircle2 size={16} className="text-emerald-400" />
                    : <span className="text-white/40 text-[10px] font-bold">{i + 1}</span>
                  }
                </div>
                <p className={`text-base font-display font-bold ${step.done ? 'text-white/30 line-through' : 'text-white/90'}`}>{step.label}</p>
                {!step.done && status === 'draft' && (
                  <button
                    onClick={() => navigate('/kyc', { state: { step: i } })}
                    className="ml-auto text-brand-300 hover:text-brand-400 text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1 bg-brand-300/10 px-3 py-1.5 rounded-full"
                  >
                    Complete <ChevronRight size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Bell size={14} className="text-white/60" />
              </div>
              <h3 className="label !mb-0">Recent Activity</h3>
            </div>
            <div className="space-y-0 relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
              {notifications.map((n) => (
                <div key={n.id} className="relative flex items-start gap-6 py-4">
                  <div className="w-6 h-6 rounded-full bg-void border border-brand-300 flex items-center justify-center flex-shrink-0 mt-0.5 z-10">
                    <div className="w-2 h-2 rounded-full bg-brand-300 shadow-[0_0_8px_rgba(253,224,71,0.6)]" />
                  </div>
                  <div>
                    <p className="text-base font-display font-bold text-white/90 capitalize tracking-tight">{n.event_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-white/40 font-body mt-1">
                      {new Date(n.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="pb-16" />
      </div>
    </Layout>
  )
}
