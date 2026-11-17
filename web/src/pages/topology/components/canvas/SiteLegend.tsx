import React from 'react'
import { cn } from '@/lib/utils'
import { SITE_COLORS, getSiteColor } from './siteColors'

export interface SiteLegendProps {
  /** Currently active/selected site for quick-focus filtering */
  selectedSite?: string | null
  /** Callback fired when a site chip is clicked to toggle focus */
  onSiteClick?: (site: string) => void
  /** Optional counts of devices per site */
  siteCounts?: Record<string, number>
  /** Custom list of sites to display (defaults to SITE-1 through SITE-4) */
  sites?: string[]
  /** Additional CSS class names */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
}

const DEFAULT_SITES = ['SITE-1', 'SITE-2', 'SITE-3', 'SITE-4']

/**
 * Site Legend Component (Stylebook §0.1 & §4.4)
 *
 * Renders a bottom-left floating legend with swatches for physical sites/POPs.
 * Also functions as an interactive quick-focus chip group, allowing engineers
 * to filter or highlight routers belonging to specific physical sites.
 */
export const SiteLegend: React.FC<SiteLegendProps> = ({
  selectedSite,
  onSiteClick,
  siteCounts,
  sites = DEFAULT_SITES,
  className,
  style,
}) => {
  return (
    <div
      className={cn(
        'absolute bottom-3.5 left-3.5 z-20 flex items-center gap-3',
        'bg-[#1e293b]/90 dark:bg-[#1e293b]/90 bg-white/90',
        'backdrop-blur-sm border border-slate-200 dark:border-slate-700/60',
        'rounded-lg px-3.5 py-1.5 shadow-lg select-none transition-all duration-150',
        className
      )}
      style={style}
      role="toolbar"
      aria-label="Site legend and quick-focus"
      data-testid="topology-site-legend"
    >
      <div className="flex items-center gap-3">
        {sites.map((site) => {
          const color = SITE_COLORS[site] || getSiteColor(site)
          const isSelected = selectedSite?.toUpperCase() === site.toUpperCase()
          const isMuted = selectedSite && !isSelected
          const count = siteCounts?.[site]

          return (
            <button
              key={site}
              type="button"
              onClick={() => onSiteClick?.(site)}
              className={cn(
                'group flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all duration-150',
                'font-mono text-[11px] font-bold tracking-wider outline-none',
                'focus-visible:ring-1 focus-visible:ring-sky-400',
                isSelected
                  ? 'bg-slate-700/60 dark:bg-slate-700/70 text-white ring-1 ring-sky-400/80 shadow-sm'
                  : isMuted
                  ? 'text-slate-400/60 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              )}
              title={
                isSelected
                  ? `Đang lọc: ${site} (Bấm để hủy lọc)`
                  : `Lọc nhanh theo trạm: ${site}`
              }
              aria-pressed={isSelected}
              data-site={site}
              data-testid={`site-legend-chip-${site}`}
            >
              <i
                className="w-2.5 h-2.5 rounded-full inline-block transition-transform duration-150 group-hover:scale-125"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span>{site}</span>
              {typeof count === 'number' && (
                <span
                  className={cn(
                    'text-[10px] font-semibold px-1 rounded-sm ml-0.5',
                    isSelected
                      ? 'bg-sky-500/20 text-sky-300'
                      : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Clear filter chip when a site is currently active */}
      {selectedSite && (
        <button
          type="button"
          onClick={() => onSiteClick?.(selectedSite)}
          className={cn(
            'text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded',
            'text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700',
            'border border-slate-700/50 transition-colors'
          )}
          title="Hủy lọc trạm (Hiện tất cả)"
          aria-label="Hủy lọc trạm"
        >
          ✕
        </button>
      )}
    </div>
  )
}
