import React from 'react'
import { cn } from '@/lib/utils'
import type { KHopDistance, KHopFilterMode } from './egoNetwork'

export interface KHopControlsProps {
  /** Single focused epicenter node ID (legacy or single beacon) */
  focusNodeId?: string | null
  /** List or Set of all active focused epicenter node IDs (Stylebook §3.5: multiple beacons) */
  focusNodeIds?: string[] | Set<string> | null
  /** Active k-hop radius (1, 2, 3, or 'all') */
  kHop: KHopDistance
  /** Visual presentation mode: ghost opacity vs prune hide */
  filterMode?: KHopFilterMode
  /** Callback when user changes hop radius */
  onKHopChange: (kHop: KHopDistance) => void
  /** Callback when user toggles ghost / prune mode */
  onFilterModeChange?: (mode: KHopFilterMode) => void
  /** Callback to clear all active beacon focuses */
  onClearFocus?: () => void
  /** Language locale */
  locale?: 'vi' | 'en'
  /** Additional CSS class names */
  className?: string
  /** Inline style */
  style?: React.CSSProperties
}

/**
 * Floating k-Hop Ego-Network Filter Toolbar (Stylebook §3.5 & Step 5.3)
 *
 * Provides NOC engineers with high-precision hop distance toggles (1-Hop, 2-Hop, 3-Hop, All)
 * and rendering mode (Ghost 0.15 opacity vs Prune isolate) centered around active beacon routers.
 */
export const KHopControls: React.FC<KHopControlsProps> = ({
  focusNodeId,
  focusNodeIds,
  kHop,
  filterMode = 'ghost',
  onKHopChange,
  onFilterModeChange,
  onClearFocus,
  locale = 'vi',
  className,
  style,
}) => {
  const isEn = locale === 'en'

  // Normalize active beacon list
  const activeIds: string[] = []
  if (focusNodeIds instanceof Set) {
    activeIds.push(...Array.from(focusNodeIds))
  } else if (Array.isArray(focusNodeIds)) {
    activeIds.push(...focusNodeIds)
  } else if (focusNodeId) {
    activeIds.push(focusNodeId)
  }

  // If no beacons are active, hide the k-hop controls
  if (activeIds.length === 0) return null

  const labelBadge =
    activeIds.length === 1
      ? activeIds[0]
      : isEn
        ? `${activeIds.length} BEACONS`
        : `${activeIds.length} TIÊU ĐIỂM`

  const hopOptions: Array<{ value: KHopDistance; label: string }> = [
    { value: 1, label: '1-HOP' },
    { value: 2, label: '2-HOP' },
    { value: 3, label: '3-HOP' },
    { value: 'all', label: isEn ? 'ALL' : 'TẤT CẢ' },
  ]

  return (
    <div
      className={cn(
        'absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 p-1 rounded-lg',
        'bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md',
        'border border-slate-200/90 dark:border-slate-800/90 shadow-lg',
        'select-none transition-all duration-200',
        className
      )}
      style={style}
      data-testid="topology-khop-controls"
      role="toolbar"
      aria-label="k-Hop Ego-Network Controls"
    >
      {/* Epicenter Target Identifier Pill */}
      <div
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-md',
          'bg-sky-500/10 border border-sky-500/30 text-[#0284c7] dark:text-[#38bdf8]',
          'font-mono text-[10px] font-bold tracking-wider uppercase'
        )}
        title={
          isEn
            ? `Active Beacons: ${activeIds.join(', ')}`
            : `Các tiêu điểm đang bật: ${activeIds.join(', ')}`
        }
        data-testid="khop-epicenter-badge"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse shrink-0" />
        <span>{labelBadge}</span>
      </div>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 my-auto mx-0.5" />

      {/* Hop Distance Buttons */}
      <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900/80 p-0.5 rounded-md">
        {hopOptions.map((opt) => {
          const isActive = kHop === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onKHopChange(opt.value)}
              className={cn(
                'px-2 py-1 font-mono text-[10px] font-bold tracking-wider rounded transition-all outline-none',
                isActive
                  ? 'bg-white dark:bg-[#1d4ed8] text-[#1d4ed8] dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
              )}
              data-testid={`khop-btn-${opt.value}`}
              aria-pressed={isActive}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Ghost vs Prune Mode Switch */}
      {onFilterModeChange && kHop !== 'all' && (
        <>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 my-auto mx-0.5" />
          <button
            type="button"
            onClick={() => onFilterModeChange(filterMode === 'ghost' ? 'prune' : 'ghost')}
            className={cn(
              'px-2 py-1 font-mono text-[9.5px] font-bold tracking-wider rounded transition-all border outline-none',
              filterMode === 'prune'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )}
            title={
              filterMode === 'ghost'
                ? isEn
                  ? 'Ghost Mode (0.15 opacity) - Click to Switch to Prune'
                  : 'Chế độ mờ (0.15 opacity) - Bấm để chuyển sang Ẩn hoàn toàn'
                : isEn
                  ? 'Prune Mode (Hidden) - Click to Switch to Ghost'
                  : 'Chế độ ẩn (Prune) - Bấm để chuyển sang Làm mờ'
            }
            data-testid="khop-mode-toggle"
          >
            {filterMode === 'ghost' ? (isEn ? 'GHOST' : 'LÀM MỜ') : isEn ? 'PRUNE' : 'ẨN NGOÀI'}
          </button>
        </>
      )}

      {/* Clear All Beacons Button */}
      {onClearFocus && (
        <>
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 my-auto mx-0.5" />
          <button
            type="button"
            onClick={onClearFocus}
            className="px-1.5 py-1 font-mono text-[9px] font-semibold tracking-wider text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
            title={isEn ? 'Clear all beacons' : 'Gỡ toàn bộ tiêu điểm'}
            data-testid="khop-clear-focus-btn"
          >
            ✕
          </button>
        </>
      )}
    </div>
  )
}
