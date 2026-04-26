import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import api from '../../api/client'
import {
  User, Building2, FileUp, CheckCircle2, ChevronRight,
  ChevronLeft, Loader2, Upload, X, FileText, Image,
  AlertCircle, Send
} from 'lucide-react'

const STEPS = [
  { id: 0, label: 'Personal',  icon: User },
  { id: 1, label: 'Business',  icon: Building2 },
  { id: 2, label: 'Documents', icon: FileUp },
  { id: 3, label: 'Review',    icon: CheckCircle2 },
]

const BUSINESS_TYPES = [
  { value: 'individual',      label: 'Individual / Freelancer' },
  { value: 'sole_proprietor', label: 'Sole Proprietorship' },
  { value: 'partnership',     label: 'Partnership Firm' },
  { value: 'private_limited', label: 'Private Limited Company' },
  { value: 'llp',             label: 'LLP' },
  { value: 'other',           label: 'Other' },
]

const DOC_TYPES = [
  { key: 'pan',            label: 'PAN Card',        hint: 'Clear scan of your PAN card' },
  { key: 'aadhaar',        label: 'Aadhaar Card',    hint: 'Both sides of Aadhaar' },
  { key: 'bank_statement', label: 'Bank Statement',  hint: 'Last 3 months, all pages' },
]

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-10 w-full overflow-x-auto pb-4">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const done    = current > i
        const active  = current === i
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 border ${
              active  ? 'bg-brand-300 text-black border-brand-300 shadow-[0_0_15px_rgba(253,224,71,0.3)]' :
              done    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        'bg-white/5 text-white/40 border-white/10'
            }`}>
              {done
                ? <CheckCircle2 size={16} strokeWidth={2.5} />
                : <Icon size={16} strokeWidth={2.5} />
              }
              <span className="text-sm font-display font-bold uppercase tracking-wider">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 md:w-16 h-0.5 mx-2 transition-colors duration-300 rounded-full ${done ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function FieldGroup({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function DocUploadBox({ docType, label, hint, existingDoc, onUpload, uploading }) {
  const ref = useRef()
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleFile = async (file) => {
    if (!file) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
      setLocalError('Only PDF, JPG, PNG allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('File too large (max 5 MB)')
      return
    }
    setLocalError('')
    await onUpload(docType, file)
  }

  return (
    <div className="space-y-2">
      <p className="text-base font-display font-bold text-white">{label}</p>
      <p className="text-sm font-body text-white/50">{hint}</p>

      {existingDoc ? (
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md">
          <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body text-white/90 truncate">{existingDoc.file_name}</p>
            <p className="text-xs text-emerald-400 mt-1">{(existingDoc.file_size / 1024).toFixed(0)} KB</p>
          </div>
          <button
            onClick={() => ref.current?.click()}
            className="text-xs text-emerald-400 font-display font-bold hover:underline flex-shrink-0 uppercase tracking-widest px-3 py-1.5 bg-emerald-500/20 rounded-full"
          >
            Replace
          </button>
          <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragOver ? 'border-brand-300 bg-brand-300/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'
          }`}
          onClick={() => ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
        >
          {uploading === docType ? (
            <Loader2 size={28} className="animate-spin text-brand-300 mx-auto mb-3" />
          ) : (
            <Upload size={28} className="text-white/40 mx-auto mb-3" />
          )}
          <p className="text-sm font-display font-bold text-white/60">
            {uploading === docType ? 'Uploading…' : 'Drop file here or click to browse'}
          </p>
          <p className="text-xs text-white/40 mt-2 font-body">PDF, JPG, PNG · max 5 MB</p>
          <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}

      {localError && (
        <p className="text-xs text-red-400 font-body flex items-center gap-1 mt-2">
          <AlertCircle size={14} /> {localError}
        </p>
      )}
    </div>
  )
}

export default function KYCFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(location.state?.step || 0)
  const [submission, setSubmission] = useState(null)
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    business_name: '', business_type: '', monthly_volume: '',
  })
  const [docs, setDocs] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(null)
  const [error, setError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    api.get('/kyc/submission/').then(({ data }) => {
      setSubmission(data)
      setForm({
        full_name:      data.full_name      || '',
        email:          data.email          || '',
        phone:          data.phone          || '',
        business_name:  data.business_name  || '',
        business_type:  data.business_type  || '',
        monthly_volume: data.monthly_volume || '',
      })
      const docMap = {}
      ;(data.documents || []).forEach(d => { docMap[d.doc_type] = d })
      setDocs(docMap)
    }).finally(() => setLoading(false))
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const saveProgress = async () => {
    setSaving(true)
    setError('')
    try {
      const { data } = await api.put('/kyc/submission/', form)
      setSubmission(data)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleNext = async () => {
    if (step < 2) {
      await saveProgress()
      setStep(s => s + 1)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleUpload = async (docType, file) => {
    setUploading(docType)
    setError('')
    try {
      const fd = new FormData()
      fd.append('doc_type', docType)
      fd.append('file', file)
      const { data } = await api.post('/kyc/documents/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setDocs(d => ({ ...d, [docType]: data }))
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed. Check file type and size.')
    } finally {
      setUploading(null)
    }
  }

  const handleSubmit = async () => {
    setSubmitLoading(true)
    setError('')
    try {
      // Save latest form data first
      await api.put('/kyc/submission/', form)
      const { data } = await api.post('/kyc/submission/submit/')
      setSubmission(data)
      navigate('/dashboard')
    } catch (e) {
      setError(e.response?.data?.message || 'Submission failed.')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 size={28} className="animate-spin text-brand-600" />
        </div>
      </Layout>
    )
  }

  const canSubmit = form.full_name && form.email && form.business_name &&
    Object.keys(docs).length >= 3

  const isReadonly = submission?.status && !['draft', 'more_info_requested'].includes(submission.status)

  return (
    <Layout>
      <div className="animate-slide-up pb-16">
        <div className="bg-brand-300 px-10 pt-16 pb-20 liquid-section mb-12 shadow-[0_20px_50px_rgba(253,224,71,0.15)] relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none liquid-section" />
          <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-black/60 font-display font-bold text-xs uppercase tracking-widest mb-4">Onboarding Flow</p>
              <h1 className="font-display font-bold text-black text-6xl tracking-tight leading-[0.9]">KYC Application</h1>
              <p className="text-black/70 font-body text-lg mt-3">Complete all sections to go live</p>
            </div>
            {submission?.status && <StatusBadge status={submission.status} size="lg" />}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-10">
          {isReadonly && (
            <div className="mb-8 px-5 py-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-3 text-blue-400 text-sm font-body backdrop-blur-md shadow-lg">
              <AlertCircle size={18} className="flex-shrink-0" />
              Your application is {submission.status.replace(/_/g, ' ')} — editing is disabled.
            </div>
          )}

          <StepIndicator current={step} />

          {error && (
            <div className="mb-6 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-body flex items-center gap-3 animate-fade-in backdrop-blur-md shadow-lg">
              <AlertCircle size={18} className="flex-shrink-0" /> {error}
            </div>
          )}

          <div className="card p-10 animate-fade-in" key={step}>

          {/* Step 0: Personal */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="font-display font-bold text-white text-3xl tracking-tight">Personal Details</h2>
                <p className="text-white/50 font-body text-sm mt-2">Tell us about yourself</p>
              </div>
              <FieldGroup label="Full name">
                <input disabled={isReadonly} type="text" value={form.full_name} onChange={set('full_name')}
                  placeholder="Arjun Sharma" className="input-field" />
              </FieldGroup>
              <FieldGroup label="Email address">
                <input disabled={isReadonly} type="email" value={form.email} onChange={set('email')}
                  placeholder="arjun@agency.com" className="input-field" />
              </FieldGroup>
              <FieldGroup label="Phone number">
                <input disabled={isReadonly} type="tel" value={form.phone} onChange={set('phone')}
                  placeholder="+91 98765 43210" className="input-field" />
              </FieldGroup>
            </div>
          )}

          {/* Step 1: Business */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="font-display font-bold text-white text-3xl tracking-tight">Business Details</h2>
                <p className="text-white/50 font-body text-sm mt-2">Tell us about your business</p>
              </div>
              <FieldGroup label="Business / Agency name">
                <input disabled={isReadonly} type="text" value={form.business_name} onChange={set('business_name')}
                  placeholder="Arjun Designs Studio" className="input-field" />
              </FieldGroup>
              <FieldGroup label="Business type">
                <select disabled={isReadonly} value={form.business_type} onChange={set('business_type')} className="input-field text-white/90 bg-void">
                  <option value="">Select type…</option>
                  {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Expected monthly volume (USD)">
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 text-base font-body">$</span>
                  <input
                    disabled={isReadonly}
                    type="number" min="0" step="100"
                    value={form.monthly_volume}
                    onChange={set('monthly_volume')}
                    placeholder="5000"
                    className="input-field pl-10"
                  />
                </div>
              </FieldGroup>
            </div>
          )}

          {/* Step 2: Documents */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="mb-4">
                <h2 className="font-display font-bold text-white text-3xl tracking-tight">KYC Documents</h2>
                <p className="text-white/50 font-body text-sm mt-2">Upload all three documents. PDF, JPG, PNG · max 5 MB each.</p>
              </div>
              {DOC_TYPES.map(d => (
                <DocUploadBox
                  key={d.key}
                  docType={d.key}
                  label={d.label}
                  hint={d.hint}
                  existingDoc={docs[d.key]}
                  onUpload={handleUpload}
                  uploading={uploading}
                />
              ))}
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="mb-4">
                <h2 className="font-display font-bold text-white text-3xl tracking-tight">Review & Submit</h2>
                <p className="text-white/50 font-body text-sm mt-2">Confirm your details before submitting</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Name',           value: form.full_name },
                  { label: 'Email',          value: form.email },
                  { label: 'Phone',          value: form.phone },
                  { label: 'Business',       value: form.business_name },
                  { label: 'Business type',  value: BUSINESS_TYPES.find(t => t.value === form.business_type)?.label || form.business_type },
                  { label: 'Monthly volume', value: form.monthly_volume ? `$${Number(form.monthly_volume).toLocaleString()}` : '—' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-xs font-display font-bold text-white/50 uppercase tracking-widest">{r.label}</span>
                    <span className="text-sm font-body text-white">{r.value || <span className="text-white/20">—</span>}</span>
                  </div>
                ))}

                <div className="pt-4">
                  <p className="text-xs font-display font-bold text-white/50 uppercase tracking-widest mb-4">Documents</p>
                  <div className="space-y-3">
                    {DOC_TYPES.map(d => (
                      <div key={d.key} className="flex items-center gap-3 py-2 px-4 bg-white/5 rounded-xl border border-white/5">
                        {docs[d.key]
                          ? <CheckCircle2 size={18} className="text-emerald-400" />
                          : <X size={18} className="text-red-400" />
                        }
                        <span className="text-sm font-body text-white/80">{d.label}</span>
                        {docs[d.key] && (
                          <span className="text-xs text-white/40 ml-auto">{docs[d.key].file_name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!canSubmit && (
                <div className="px-5 py-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-body flex items-center gap-3 backdrop-blur-md">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  Please complete all fields and upload all 3 documents before submitting.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/dashboard')}
            className="btn-secondary"
          >
            <ChevronLeft size={15} />
            {step === 0 ? 'Back to dashboard' : 'Previous'}
          </button>

          <div className="flex items-center gap-3">
            {step < 2 && !isReadonly && (
              <button onClick={saveProgress} disabled={saving} className="btn-secondary">
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                Save progress
              </button>
            )}

            {step < 3 && (
              <button
                onClick={handleNext}
                disabled={saving || (uploading !== null)}
                className="btn-primary"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                Next step
                <ChevronRight size={15} />
              </button>
            )}

            {step === 3 && !isReadonly && (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitLoading}
                className="btn-primary"
              >
                {submitLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {submitLoading ? 'Submitting…' : 'Submit for review'}
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </Layout>
  )
}
