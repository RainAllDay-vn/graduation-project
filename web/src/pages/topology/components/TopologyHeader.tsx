import React from 'react'
import { cn } from '@/lib/utils'

export interface TopologyHeaderProps {
  /** Optional ID of active incident (triggers contextual elevation) */
  incidentId?: string | null
  /** Optional title of the incident */
  incidentTitle?: string
  /** Status of the incident (e.g. 'OPEN' / 'INVESTIGATING' / 'RESOLVED') */
  incidentStatus?: string
  /** Optional callback to exit Incident Mode back to Standard Full Network */
  onExitIncident?: () => void
  /** Total device count across managed topology */
  totalNodes?: number
  /** Total link count across managed topology */
  totalLinks?: number
  /** Currently focused node ID (if any) */
  focusNodeId?: string | null
  /** Current hop distance if focused */
  focusHop?: number | 'all'
  /** Locale language code */
  locale?: 'vi' | 'en'
  /** Additional CSS class names */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
}

/**
 * Topology Contextual Thin Header (Stylebook §0.1 & Fig 0.1)
 *
 * Renders the compact header bar displaying the brand identity and dynamic
 * context chips (Infrastructure Overview vs. Incident Elevation mode).
 */
export const TopologyHeader: React.FC<TopologyHeaderProps> = ({
  incidentId,
  incidentTitle,
  incidentStatus = 'INVESTIGATING',
  onExitIncident,
  totalNodes = 78,
  totalLinks = 152,
  focusNodeId,
  focusHop = 2,
  locale = 'vi',
  className,
  style,
}) => {
  const isEn = locale === 'en'

  const normalizedStatus = (incidentStatus || 'INVESTIGATING').toUpperCase()
  const isResolved = normalizedStatus === 'RESOLVED' || normalizedStatus === 'MITIGATED'
  const statusLabel = (() => {
    if (isEn) return normalizedStatus
    switch (normalizedStatus) {
      case 'OPEN':
        return 'ĐANG MỞ'
      case 'PRIORITIZED':
        return 'ƯU TIÊN'
      case 'INVESTIGATING':
        return 'ĐANG ĐIỀU TRA'
      case 'MITIGATED':
        return 'ĐÃ GIẢM THIỂU'
      case 'RESOLVED':
        return 'ĐÃ XỬ LÝ'
      default:
        return incidentStatus
    }
  })()

  return (
    <header
      className={cn(
        'h-11 shrink-0 px-4 flex items-center justify-between',
        'bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800',
        'select-none transition-colors duration-150 z-10',
        className
      )}
      style={style}
      data-testid="topology-header"
    >
      {/* Left: Brand & Section Identifier */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shrink-0 shadow-xs" />
          <span className="font-mono font-extrabold text-xs tracking-[0.14em] text-slate-900 dark:text-slate-100 uppercase">
            NOC TOPOLOGY
          </span>
        </div>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

        <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase hidden sm:inline">
          {isEn ? 'Single Topology Engine' : 'Không gian làm việc Topology'}
        </span>
      </div>

      {/* Center: Contextual Status Chips (Stylebook §0.1) */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Incident Active Badge (Elevated Context) */}
        {incidentId ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className={cn(
                'flex items-center gap-2 px-2.5 py-1 rounded-md border min-w-0',
                isResolved
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 animate-pulse',
                'font-mono text-[10.5px] font-bold tracking-wide shadow-xs'
              )}
              title={incidentTitle || `Sự cố ${incidentId}`}
              data-testid="topology-incident-chip"
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full inline-block shrink-0',
                  isResolved ? 'bg-emerald-500' : 'bg-rose-500'
                )}
              />
              <span className="truncate max-w-[360px]">
                {incidentId} · {statusLabel}
                {incidentTitle ? ` · ${incidentTitle}` : ''}
              </span>
            </div>

            {onExitIncident && (
              <button
                type="button"
                onClick={onExitIncident}
                data-testid="topology-exit-incident-btn"
                title={isEn ? 'Exit incident investigation view' : 'Thoát chế độ sự cố'}
                className="shrink-0 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold transition-colors cursor-pointer"
              >
                × {isEn ? 'Exit' : 'Thoát'}
              </button>
            )}
          </div>
        ) : focusNodeId ? (
          /* Focus Node Badge */
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md border',
              'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60',
              'text-sky-700 dark:text-sky-300 font-mono text-[10.5px] font-bold tracking-wide'
            )}
            data-testid="topology-focus-chip"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
            <span>
              {isEn ? 'FOCUS:' : 'TIÊU ĐIỂM:'} {focusNodeId} ·{' '}
              {focusHop === 'all'
                ? isEn
                  ? 'ALL HOPS'
                  : 'TOÀN MẠNG'
                : `${focusHop}${isEn ? '-HOP RADIUS' : '-HOP LÂN CẬN'}`}
            </span>
          </div>
        ) : (
          /* Standard Free Infrastructure Overview Badge */
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md border',
              'bg-slate-100 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/60',
              'text-slate-600 dark:text-slate-300 font-mono text-[10.5px] font-semibold tracking-wide'
            )}
            data-testid="topology-overview-chip"
          >
            <span>
              {isEn
                ? `FULL NETWORK · ${totalNodes} DEVICES · ${totalLinks} TRUNKS`
                : `TOÀN MẠNG · ${totalNodes} THIẾT BỊ · ${totalLinks} LIÊN KẾT`}
            </span>
          </div>
        )}
      </div>

      {/* Right: Architecture Notice / Spec Ref */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-wider">
          CH.0 · STYLEBOOK
        </span>
      </div>
    </header>
  )
}
