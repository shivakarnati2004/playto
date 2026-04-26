import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import api from '../../api/client'
import {
  ArrowLeft, CheckCircle2, XCircle, MessageSquare,
  FileText, User, Building2, ExternalLink, Loader2,
  AlertTriangle, Clock, FileCheck
} from 'lucide-react'

const ALLOWED_REVIEWER_TRANSITIONS = {
  submitted:    ['under_review'],
  under_review: ['approved', 'rejected', 'more_info_requested'],
}

const TRANSITION_CONFIG = {
  under_review:        { label: 'Claim & Start Review', icon: FileCheck,    cls: 'btn-secondary',  requiresReason: false },
  approved:            { label: 'Approve',               icon: CheckCircle2, cls: 'btn-success',    requiresReason: false },
  rejected:            { label: 'Reject',                icon: XCircle,      cls: 'btn-danger',     requiresReason: true  },
  more_info_requested: { label: 'Request More Info',     icon: MessageSquare,cls: 'btn-secondary',  requiresReason: true  },
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-xs font-display font-bold text-white/40 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-body text-white text-right max-w-xs">{value || <span className="text-white/20">—</span>}</span>
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card p-8 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon size={16} className="text-white/40" />
        </div>
        <h3 className="font-display font-bold text-white text-lg tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function DocumentCard({ doc, request }) {
  const isPdf = doc.file_name?.endsWith('.pdf')
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-300 hover:bg-brand-300/10 transition-all group shadow-lg"
    >
      <div className="w-10 h-10 rounded-xl bg-void flex items-center justify-center flex-shrink-0 group-hover:bg-brand-300 transition-colors border border-white/10 group-hover:border-brand-300 shadow-inner">
        <FileText size={18} className="text-white/40 group-hover:text-black" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-display font-bold text-white uppercase tracking-wider group-hover:text-brand-300 transition-colors">
          {doc.doc_type.replace(/_/g, ' ')}
        </p>
        <p className="text-xs font-body text-white/50 truncate mt-0.5">{doc.file_name}</p>
        <p className="text-[10px] font-display font-bold text-white/30 tracking-widest uppercase mt-0.5">{(doc.file_size / 1024).toFixed(0)} KB</p>
      </div>
      <ExternalLink size={16} className="text-white/20 group-hover:text-brand-300 flex-shrink-0 transition-colors" />
    </a>
  )
}

function TransitionPanel({ submission, onTransition }) {
  const allowedTargets = ALLOWED_REVIEWER_TRANSITIONS[submission.status] || []
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (allowedTargets.length === 0) return null

  const cfg = selectedTarget ? TRANSITION_CONFIG[selectedTarget] : null
  const needsReason = cfg?.requiresReason

  const handleConfirm = async () => {
    if (needsReason && !reason.trim()) {
      setError('Please provide a reason.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onTransition(selectedTarget, reason)
      setSelectedTarget(null)
      setReason('')
    } catch (e) {
      setError(e.response?.data?.message || 'Action failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8 border-brand-300/30 bg-brand-300/5 shadow-[0_0_30px_rgba(253,224,71,0.05)]">
      <h3 className="label !mb-6">Reviewer Actions</h3>

      {!selectedTarget ? (
        <div className="flex flex-wrap gap-3">
          {allowedTargets.map(target => {
            const c = TRANSITION_CONFIG[target]
            const Icon = c.icon
            return (
              <button
                key={target}
                onClick={() => setSelectedTarget(target)}
                className={c.cls}
              >
                <Icon size={16} strokeWidth={2.5} />
                {c.label}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="animate-fade-in space-y-5">
          <div className="flex items-center gap-2 text-sm font-body text-white/60 bg-white/5 inline-flex px-4 py-2 rounded-lg">
            <span>Action:</span>
            <span className="font-display font-bold text-white uppercase tracking-widest">{cfg.label}</span>
          </div>

          {needsReason && (
            <div>
              <label className="label">
                {selectedTarget === 'rejected' ? 'Rejection reason *' : 'What additional info is needed? *'}
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder={selectedTarget === 'rejected'
                  ? 'e.g. PAN card image is blurry, please re-upload…'
                  : 'e.g. Please provide a clearer scan of your Aadhaar back side…'
                }
                className="input-field resize-none bg-void text-white"
              />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm font-body flex items-center gap-2 bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
              <AlertTriangle size={15} /> {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={loading || (needsReason && !reason.trim())}
              className={cfg.cls}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <cfg.icon size={16} strokeWidth={2.5} />}
              {loading ? 'Processing…' : 'Confirm Action'}
            </button>
            <button onClick={() => { setSelectedTarget(null); setReason(''); setError('') }} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function timeAgo(dt) {
  if (!dt) return '—'
  const diff = (Date.now() - new Date(dt).getTime()) / 1000
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h ago`
  if (h > 0) return `${h}h ${m}m ago`
  return `${m}m ago`
}

export default function SubmissionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api.get(`/reviewer/submissions/${id}/`)
      .then(({ data }) => setSubmission(data))
      .catch(() => setError('Submission not found.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleTransition = async (target, reason) => {
    const { data } = await api.post(`/reviewer/submissions/${id}/transition/`, {
      target_state: target,
      reason,
    })
    setSubmission(data)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 size={26} className="animate-spin text-brand-600" />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <p className="text-red-500 font-body">{error}</p>
          <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Go back</button>
        </div>
      </Layout>
    )
  }

  const s = submission
  const atRisk = s.is_at_risk
  const BUSINESS_TYPES = {
    individual: 'Individual / Freelancer', sole_proprietor: 'Sole Proprietorship',
    partnership: 'Partnership Firm', private_limited: 'Private Limited',
    llp: 'LLP', other: 'Other',
  }

  return (
    <Layout>
      <div className="animate-slide-up pb-16">
        <div className="bg-brand-300 px-10 pt-16 pb-20 liquid-section mb-12 shadow-[0_20px_50px_rgba(253,224,71,0.15)] relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none liquid-section" />
          <div className="max-w-5xl mx-auto relative z-10">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-black/60 hover:text-black text-xs font-display font-bold uppercase tracking-widest mb-6 transition-colors px-4 py-2 bg-black/5 hover:bg-black/10 rounded-full w-fit">
              <ArrowLeft size={14} strokeWidth={2.5} /> Back to queue
            </button>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-black/60 font-display font-bold text-xs uppercase tracking-widest mb-4">Submission Details</p>
                <h1 className="font-display font-bold text-black text-6xl tracking-tight leading-[0.9]">
                  {s.full_name || s.merchant?.username}
                </h1>
                <p className="text-black/70 font-body text-lg mt-3">{s.merchant?.email}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {atRisk && (
                  <span className="inline-flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-widest text-orange-900 bg-orange-400 px-4 py-2 rounded-full border border-orange-500 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-orange-900 animate-pulse" />
                    At risk — {timeAgo(s.submitted_at)} in queue
                  </span>
                )}
                <StatusBadge status={s.status} size="lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-10">
          {/* Reviewer notes (if any) */}
          {s.reviewer_notes && (
            <div className="mb-6 px-6 py-5 rounded-2xl bg-orange-500/10 border border-orange-500/20 backdrop-blur-md animate-fade-in shadow-lg">
              <p className="text-[10px] font-display font-bold text-orange-400 uppercase tracking-widest mb-2">Previous Reviewer Note</p>
              <p className="text-base font-body text-white/90 leading-relaxed">{s.reviewer_notes}</p>
            </div>
          )}

          {/* Transition actions */}
          <div className="mb-8">
            <TransitionPanel submission={s} onTransition={handleTransition} />
          </div>

          <div className="grid grid-cols-2 gap-6 items-stretch">
            {/* Personal info */}
            <Section title="Personal Details" icon={User}>
              <InfoRow label="Full name" value={s.full_name} />
              <InfoRow label="Email"     value={s.email} />
              <InfoRow label="Phone"     value={s.phone} />
            </Section>

            {/* Business info */}
            <Section title="Business Details" icon={Building2}>
              <InfoRow label="Business name"   value={s.business_name} />
              <InfoRow label="Business type"   value={BUSINESS_TYPES[s.business_type] || s.business_type} />
              <InfoRow label="Monthly volume"  value={s.monthly_volume ? `$${Number(s.monthly_volume).toLocaleString()}` : '—'} />
            </Section>

            {/* Documents */}
            <div className="col-span-2">
              <Section title={`Documents (${s.documents?.length || 0} / 3)`} icon={FileText}>
                {s.documents?.length === 0 ? (
                  <p className="text-sm font-body text-white/40 italic">No documents uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {s.documents.map(doc => (
                      <DocumentCard key={doc.id} doc={doc} />
                    ))}
                  </div>
                )}
              </Section>
            </div>

            {/* Timeline */}
            <div className="col-span-2">
              <Section title="Timeline" icon={Clock}>
                <div className="flex flex-wrap gap-10">
                  {[
                    { label: 'Created',    val: s.created_at },
                    { label: 'Submitted',  val: s.submitted_at },
                    { label: 'Last updated', val: s.updated_at },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <p className="label">{label}</p>
                      <p className="text-base font-display font-bold text-white mt-1">
                        {val
                          ? new Date(val).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                          : <span className="text-white/20">—</span>}
                      </p>
                    </div>
                  ))}
                  {s.reviewer && (
                    <div>
                      <p className="label">Assigned reviewer</p>
                      <p className="text-base font-display font-bold text-brand-300 mt-1">{s.reviewer.username}</p>
                    </div>
                  )}
                </div>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
