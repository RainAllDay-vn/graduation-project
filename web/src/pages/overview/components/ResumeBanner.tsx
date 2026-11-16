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
    <div className="w-full flex items-center justify-between gap-3 bg-[#eff6ff] dark:bg-blue-950/40 border border-[#bfdbfe] dark:border-blue-900/50 rounded-xl px-4 py-2.5 text-[13px] text-[#334155] dark:text-[#cbd5e1] shadow-xs mb-5 animate-in fade-in">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#1d4ed8] dark:bg-blue-500 animate-pulse shrink-0" />
        <span>
          {isEn ? 'You have an ongoing investigation session ' : 'Bạn còn phiên điều tra dở '}
          <strong className="font-bold text-[#0f172a] dark:text-[#f8fafc]">{incidentId}</strong>
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
          className="h-8 px-3.5 bg-white dark:bg-[#1e293b] hover:bg-[#f8fafc] dark:hover:bg-[#334155] text-[#64748b] dark:text-[#cbd5e1] hover:text-[#0f172a] dark:hover:text-white border border-[#cbd5e1] dark:border-[#334155] text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          {isEn ? 'Later' : 'Để sau'}
        </button>
      </div>
    </div>
  )
}
