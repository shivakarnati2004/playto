import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import api from '../../api/client'
import {
  Clock, TrendingUp, CheckCircle2, AlertTriangle,
  ChevronRight, Loader2, RefreshCw, Users, Inbox
} from 'lucide-react'

function MetricCard({ icon: Icon, label, value, sub, highlight }) {
  return (
    <div className={`card p-6 ${highlight ? 'border-brand-300/30 bg-brand-300/10' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          highlight ? 'bg-brand-300 shadow-[0_0_15px_rgba(253,224,71,0.3)]' : 'bg-white/5'
        }`}>
          <Icon size={20} className={highlight ? 'text-black' : 'text-white/40'} strokeWidth={2.5} />
        </div>
      </div>
      <p className={`font-display font-bold text-3xl ${highlight ? 'text-brand-300' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-xs font-display font-bold uppercase tracking-widest text-white/40 mt-3">{label}</p>
      {sub && <p className="text-xs font-body text-white/30 mt-1">{sub}</p>}
    </div>
  )
}

function formatDuration(seconds) {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function timeAgo(dt) {
  if (!dt) return '—'
  const diff = (Date.now() - new Date(dt).getTime()) / 1000
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  if (h >= 24) return `${Math.floor(h/24)}d ago`
  if (h > 0) return `${h}h ${m}m ago`
  return `${m}m ago`
}

export default function ReviewerQueuePage() {
  const navigate = useNavigate()
  const [queue, setQueue]     = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    try {
      const [qRes, mRes] = await Promise.all([
        api.get('/reviewer/queue/'),
        api.get('/reviewer/metrics/'),
      ])
      setQueue(qRes.data)
      setMetrics(mRes.data)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <Layout>
      <div className="animate-slide-up pb-16">
        {/* Liquid Header */}
        <div className="bg-brand-300 px-10 pt-16 pb-20 liquid-section mb-12 shadow-[0_20px_50px_rgba(253,224,71,0.15)] relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none liquid-section" />
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-black/60 font-display font-bold text-xs uppercase tracking-widest mb-4">Reviewer Operations</p>
              <h1 className="font-display font-bold text-black text-6xl tracking-tight leading-[0.9]">Review Queue</h1>
              <p className="text-black/70 font-body text-lg mt-3">Submissions awaiting review, oldest first</p>
            </div>
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="px-5 py-3 bg-black text-white rounded-full font-display font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh Queue
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-10">
          {/* Metrics */}
          {metrics && (
            <div className="grid grid-cols-4 gap-6 mb-10">
              <MetricCard icon={Inbox}         label="In queue"             value={metrics.queue_count}                   sub="submitted + under review" />
              <MetricCard icon={Clock}         label="Avg. time in queue"   value={formatDuration(metrics.avg_time_in_queue)} sub="for current queue" />
              <MetricCard icon={TrendingUp}    label="Approval rate (7d)"   value={`${metrics.approval_rate_7d}%`}        sub={`of ${metrics.total_resolved_7d} resolved`} />
              <MetricCard icon={AlertTriangle} label="At-risk submissions"  value={metrics.at_risk_count}                 sub="waiting > 24 hours" highlight={metrics.at_risk_count > 0} />
            </div>
          )}

          {/* Queue table */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={26} className="animate-spin text-brand-300" />
              </div>
            ) : queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <p className="font-display font-bold text-white text-2xl tracking-tight">Queue is clear</p>
                <p className="text-white/50 font-body mt-2">All submissions have been reviewed.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    {['Merchant', 'Business', 'Volume', 'Submitted', 'Status', 'SLA', ''].map(h => (
                      <th key={h} className="px-6 py-4 text-[10px] font-display font-bold text-white/40 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {queue.map((sub, i) => (
                    <tr
                      key={sub.id}
                      onClick={() => navigate(`/reviewer/submissions/${sub.id}`)}
                      className={`hover:bg-white/5 cursor-pointer transition-colors group ${
                        sub.is_at_risk ? 'bg-orange-500/10' : ''
                      }`}
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-display font-bold text-white group-hover:text-brand-300 transition-colors">{sub.full_name || sub.merchant_username}</p>
                        <p className="text-xs font-body text-white/40 mt-0.5">{sub.merchant_email}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-body text-white">{sub.business_name || '—'}</p>
                        <p className="text-xs text-white/40 mt-0.5 capitalize">{sub.business_type?.replace(/_/g, ' ') || ''}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-body text-white tabular-nums">
                          {sub.monthly_volume ? `$${Number(sub.monthly_volume).toLocaleString()}` : '—'}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-body text-white">{timeAgo(sub.submitted_at)}</p>
                        <p className="text-xs text-white/40 mt-0.5">{sub.documents_count}/3 docs</p>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-6 py-5">
                        {sub.is_at_risk ? (
                          <span className="inline-flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                            At risk
                          </span>
                        ) : (
                          <span className="text-xs text-white/20 font-body">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <ChevronRight size={18} className="text-white/20 group-hover:text-brand-300 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
