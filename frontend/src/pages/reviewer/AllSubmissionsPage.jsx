import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import StatusBadge from '../../components/StatusBadge'
import api from '../../api/client'
import { ChevronRight, Loader2, Search, Filter } from 'lucide-react'

const STATUS_FILTERS = [
  { value: '',                   label: 'All' },
  { value: 'draft',              label: 'Draft' },
  { value: 'submitted',          label: 'Submitted' },
  { value: 'under_review',       label: 'Under Review' },
  { value: 'approved',           label: 'Approved' },
  { value: 'rejected',           label: 'Rejected' },
  { value: 'more_info_requested',label: 'More Info' },
]

function timeAgo(dt) {
  if (!dt) return '—'
  const diff = (Date.now() - new Date(dt).getTime()) / 1000
  const h = Math.floor(diff / 3600)
  if (h >= 24) return `${Math.floor(h / 24)}d ago`
  const m = Math.floor((diff % 3600) / 60)
  if (h > 0) return `${h}h ${m}m ago`
  return `${m}m ago`
}

export default function AllSubmissionsPage() {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [statusFilter, setStatus]     = useState('')
  const [search, setSearch]           = useState('')

  useEffect(() => {
    setLoading(true)
    const params = statusFilter ? `?status=${statusFilter}` : ''
    api.get(`/reviewer/submissions/${params}`)
      .then(({ data }) => setSubmissions(data))
      .finally(() => setLoading(false))
  }, [statusFilter])

  const filtered = submissions.filter(s => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      s.merchant_username?.toLowerCase().includes(q) ||
      s.merchant_email?.toLowerCase().includes(q) ||
      s.full_name?.toLowerCase().includes(q) ||
      s.business_name?.toLowerCase().includes(q)
    )
  })

  return (
    <Layout>
      <div className="p-8 animate-slide-up">
        <div className="mb-8">
          <h1 className="font-display font-bold text-ink text-3xl">All Submissions</h1>
          <p className="text-gray-400 font-body text-sm mt-0.5">Complete history of KYC applications</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="input-field pl-9 py-2.5 text-sm"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-display font-semibold transition-all duration-150 ${
                  statusFilter === f.value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={26} className="animate-spin text-brand-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="font-display font-semibold text-gray-400 text-base">No submissions found</p>
              <p className="text-gray-300 text-sm font-body mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Merchant', 'Business', 'Monthly Volume', 'Submitted', 'Updated', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-display font-semibold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(sub => (
                  <tr
                    key={sub.id}
                    onClick={() => navigate(`/reviewer/submissions/${sub.id}`)}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/70 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-display font-semibold text-ink">{sub.full_name || sub.merchant_username}</p>
                      <p className="text-xs font-body text-gray-400">{sub.merchant_email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-body text-ink">{sub.business_name || '—'}</p>
                    </td>
                    <td className="px-5 py-4 tabular-nums">
                      <p className="text-sm font-body text-ink">
                        {sub.monthly_volume ? `$${Number(sub.monthly_volume).toLocaleString()}` : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-body text-ink">{timeAgo(sub.submitted_at)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-body text-gray-400">{timeAgo(sub.updated_at)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-5 py-4">
                      <ChevronRight size={15} className="text-gray-300 group-hover:text-brand-500 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && (
          <p className="text-xs font-body text-gray-400 mt-3 text-right">
            {filtered.length} submission{filtered.length !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </p>
        )}
      </div>
    </Layout>
  )
}
