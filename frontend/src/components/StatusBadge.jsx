const STATUS_CONFIG = {
  draft:                { label: 'Draft',              cls: 'bg-white/10 text-white',           dot: 'bg-white/50'   },
  submitted:            { label: 'Submitted',           cls: 'bg-blue-500/20 text-blue-400',     dot: 'bg-blue-400'   },
  under_review:         { label: 'Under Review',        cls: 'bg-brand-300/20 text-brand-300',   dot: 'bg-brand-300'  },
  approved:             { label: 'Approved',             cls: 'bg-emerald-500/20 text-emerald-400',dot: 'bg-emerald-400'},
  rejected:             { label: 'Rejected',             cls: 'bg-red-500/20 text-red-400',       dot: 'bg-red-400'    },
  more_info_requested:  { label: 'More Info Needed',    cls: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-400' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'bg-white/10 text-white', dot: 'bg-white/50' }
  const textSize = size === 'lg' ? 'text-sm px-4 py-2' : 'text-xs px-3 py-1.5'

  return (
    <span className={`inline-flex items-center gap-2 font-display font-bold rounded-full border border-white/10 backdrop-blur-sm ${cfg.cls} ${textSize}`}>
      <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
