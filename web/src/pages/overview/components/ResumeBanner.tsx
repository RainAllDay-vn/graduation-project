export interface ResumeBannerProps {
  incidentId: string
  regionOrSite?: string
  locale?: 'vi' | 'en'
  onResume: () => void
  onDismiss: () => void
}

export function ResumeBanner({
  incidentId,
  regionOrSite,
  locale = 'vi',
  onResume,
  onDismiss,
}: ResumeBannerProps) {
  const isEn = locale === 'en'

  return (
    <div className="w-full flex items-center justify-between gap-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl px-4 py-2.5 text-[13px] text-[#334155] shadow-xs mb-5 animate-in fade-in">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#1d4ed8] animate-pulse shrink-0" />
        <span>
          {isEn ? 'You have an ongoing investigation session ' : 'Bạn còn phiên điều tra dở '}
          <strong className="font-bold text-[#0f172a]">{incidentId}</strong>
          {regionOrSite && ` (${regionOrSite})`}.
        </span>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onResume}
          className="h-8 px-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs border-0"
        >
          {isEn ? 'Resume Investigation' : 'Tiếp tục điều tra'}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="h-8 px-3.5 bg-white hover:bg-[#f8fafc] text-[#64748b] hover:text-[#0f172a] border border-[#cbd5e1] text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          {isEn ? 'Later' : 'Để sau'}
        </button>
      </div>
    </div>
  )
}
