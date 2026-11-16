import type { ExternalSourceSummary } from '@/api/sources'
import { getSourceStatusChip, getSourceSubtitle } from './sourceUtils'

export interface SourceListPanelProps {
  sources: ExternalSourceSummary[]
  selectedId: string | null
  onSelectSource: (source: ExternalSourceSummary) => void
  locale?: 'vi' | 'en'
  isLoading?: boolean
}

export function SourceListPanel({
  sources,
  selectedId,
  onSelectSource,
  locale = 'vi',
  isLoading = false,
}: SourceListPanelProps) {
  const isEn = locale === 'en'

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center gap-2 font-mono font-extrabold text-[11px] tracking-[0.14em] text-[#64748b] dark:text-[#94a3b8] px-4 py-3.5 border-b border-[#e2e8f0] dark:border-[#1e293b] select-none">
        <span>{isEn ? 'CONNECTED SOURCES' : 'NGUỒN ĐANG KẾT NỐI'}</span>
        <span className="font-mono font-bold text-[11px] text-[#334155] dark:text-[#cbd5e1] bg-[#f1f5f9] dark:bg-[#1e293b] rounded-full px-2 py-0.5 tracking-normal">
          {isLoading ? '...' : sources.length}
        </span>
      </div>

      {/* Body: Skeleton Loader */}
      {isLoading && (
        <div className="divide-y divide-[#e2e8f0] dark:divide-[#1e293b] animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-3.5 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800/60 rounded" />
              </div>
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Body: Empty State */}
      {!isLoading && sources.length === 0 && (
        <div className="px-4 py-8 text-center text-xs text-[#94a3b8] dark:text-[#64748b]">
          {isEn ? 'No data sources configured.' : 'Chưa có nguồn dữ liệu nào được kết nối.'}
        </div>
      )}

      {/* Body: Sources List */}
      {!isLoading && sources.length > 0 && (
        <div className="divide-y divide-[#e2e8f0] dark:divide-[#1e293b]">
          {sources.map((source) => {
            const isSelected = source.id === selectedId
            const chip = getSourceStatusChip(source, locale)
            const subtitle = getSourceSubtitle(source, locale)

            return (
              <div
                key={source.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectSource(source)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectSource(source)
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors border-l-[3px] ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/30 border-l-[#1d4ed8]'
                    : 'border-l-transparent hover:bg-[#f8fafc] dark:hover:bg-[#1e293b]/50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold text-[#0f172a] dark:text-[#f8fafc] truncate">
                    {source.name}
                  </div>
                  <div className="text-[12px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 truncate">
                    {subtitle}
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-[0.04em] ${chip.className}`}
                >
                  {chip.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer Note */}
      <div className="px-4 py-2.5 text-[11.5px] text-[#94a3b8] dark:text-[#64748b] border-t border-[#e2e8f0] dark:border-[#1e293b] bg-[#fafafa] dark:bg-[#0b0f19]/40 select-none">
        {isEn
          ? 'One-way read-only — system never pushes data back to source.'
          : 'Chỉ đọc một chiều — hệ thống không gửi gì ngược về nguồn.'}
      </div>
    </div>
  )
}
