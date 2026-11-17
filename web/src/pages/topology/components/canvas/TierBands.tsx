import React from 'react'
import { cn } from '@/lib/utils'
import { TIER_COLORS } from './layoutEngine'
import type { CanvasDimensions, TierBound } from './types'

export interface TierBandsProps {
  tierBounds: TierBound[]
  dimensions: CanvasDimensions
  locale?: 'vi' | 'en'
  showCenterlines?: boolean
  showCounts?: boolean
  className?: string
}

export const TierBands: React.FC<TierBandsProps> = ({
  tierBounds,
  dimensions,
  locale = 'vi',
  showCenterlines = true,
  showCounts = true,
  className,
}) => {
  const marginX = 16
  const bandWidth = Math.max(100, dimensions.width - marginX * 2)

  return (
    <g className={cn('tier-bands-layer pointer-events-none select-none', className)}>
      {tierBounds.map((tier) => {
        const centerY = tier.y + tier.height / 2
        const tierColor = TIER_COLORS[tier.tier] || '#64748b'
        const title = locale === 'en' ? tier.nameEn : tier.nameVi

        return (
          <g key={tier.tier} className="tier-band-item" data-tier={tier.tier}>
            {/* Dashed outer boundary rectangle */}
            <rect
              x={marginX}
              y={tier.y}
              width={bandWidth}
              height={tier.height}
              rx={8}
              className="fill-slate-100/40 dark:fill-slate-900/30 stroke-slate-300/70 dark:stroke-slate-800/80 transition-colors"
              strokeDasharray="6 4"
              strokeWidth="1"
            />

            {/* Horizontal centerline guideline */}
            {showCenterlines && (
              <line
                x1={marginX + 12}
                y1={centerY}
                x2={marginX + bandWidth - 12}
                y2={centerY}
                className="stroke-slate-300/40 dark:stroke-slate-800/50"
                strokeDasharray="3 6"
                strokeWidth="1"
              />
            )}

            {/* Monospace uppercase Tier title */}
            <text
              x={marginX + 16}
              y={tier.y + 22}
              fill={tierColor}
              className="font-mono text-[10px] font-extrabold tracking-[0.14em] uppercase"
              style={{ fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)' }}
            >
              {title}
            </text>

            {/* Node count indicator */}
            {showCounts && (
              <text
                x={marginX + bandWidth - 16}
                y={tier.y + 22}
                textAnchor="end"
                className="font-mono text-[9.5px] font-semibold fill-slate-400 dark:fill-slate-500 tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)' }}
              >
                {locale === 'en'
                  ? `${tier.nodeCount} ${tier.nodeCount === 1 ? 'NODE' : 'NODES'}`
                  : `${tier.nodeCount} THIẾT BỊ`}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}
