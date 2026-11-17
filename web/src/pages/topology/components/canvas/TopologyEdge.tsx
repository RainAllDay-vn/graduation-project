import React from 'react'
import type { LinkSummary } from '@/api/topology'
import { cn } from '@/lib/utils'
import {
  computeEdgeCoordinates,
  getEdgeDashArray,
  getEdgeHealthColor,
  getEdgeStrokeWidth,
} from './edgeUtils'

export interface TopologyEdgeProps {
  link: LinkSummary
  sourcePos: { x: number; y: number }
  targetPos: { x: number; y: number }
  isSelected?: boolean
  isHovered?: boolean
  isDimmed?: boolean
  isBlastRadius?: boolean
  showPortAnchors?: boolean
  onClick?: (link: LinkSummary) => void
  onMouseEnter?: (link: LinkSummary, event: React.MouseEvent<SVGPathElement>) => void
  onMouseMove?: (link: LinkSummary, event: React.MouseEvent<SVGPathElement>) => void
  onMouseLeave?: (link: LinkSummary, event: React.MouseEvent<SVGPathElement>) => void
  className?: string
}

export const TopologyEdge: React.FC<TopologyEdgeProps> = ({
  link,
  sourcePos,
  targetPos,
  isSelected = false,
  isHovered = false,
  isDimmed = false,
  isBlastRadius = false,
  showPortAnchors = true,
  onClick,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  className,
}) => {
  const coords = computeEdgeCoordinates(sourcePos, targetPos)
  const colorStyle = getEdgeHealthColor(link.operStatus, { isSelected, isBlastRadius })
  const strokeWidth = getEdgeStrokeWidth(link.capacityGbps)
  const dashArray = getEdgeDashArray(link.utilizationPercent, link.isBackup)

  return (
    <g
      className={cn(
        'topology-edge-group transition-opacity duration-200 select-none',
        isDimmed && 'opacity-15 pointer-events-none',
        className
      )}
      data-testid={`topology-edge-${link.linkId}`}
      data-link-id={link.linkId}
      data-status={link.operStatus}
    >
      {/* 1. Selection Glow Halo */}
      {isSelected && (
        <path
          d={coords.path}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={strokeWidth + 5}
          strokeOpacity={0.4}
          strokeLinecap="round"
          className="animate-pulse pointer-events-none"
        />
      )}

      {/* 2. Blast Radius Warning Path (Incident Mode) */}
      {isBlastRadius && (
        <path
          d={coords.path}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={strokeWidth + 2.5}
          strokeDasharray="6 4"
          strokeOpacity={0.8}
          strokeLinecap="round"
          className="pointer-events-none"
        />
      )}

      {/* 3. Primary Physical Fiber Edge Line */}
      <path
        d={coords.path}
        fill="none"
        stroke={colorStyle.stroke}
        strokeWidth={isHovered ? strokeWidth + 1.2 : strokeWidth}
        strokeOpacity={isHovered ? 1.0 : colorStyle.opacity}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        className={cn(
          'transition-all duration-150 pointer-events-none',
          isHovered && 'filter drop-shadow-[0_0_4px_rgba(56,189,248,0.5)]'
        )}
      />

      {/* 4. Physical Port Anchor Dots (Stylebook rule 2.1) */}
      {showPortAnchors && (
        <g className="port-anchors pointer-events-none">
          <circle
            cx={coords.startX}
            cy={coords.startY}
            r={2.5}
            className="fill-white dark:fill-[#0f172a] transition-colors"
            stroke={colorStyle.stroke}
            strokeWidth={1.5}
          />
          <circle
            cx={coords.endX}
            cy={coords.endY}
            r={2.5}
            className="fill-white dark:fill-[#0f172a] transition-colors"
            stroke={colorStyle.stroke}
            strokeWidth={1.5}
          />
        </g>
      )}

      {/* 5. Invisible Thick Hitbox for Precise Click & Hover Interception */}
      <path
        d={coords.path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(16, strokeWidth + 10)}
        strokeLinecap="round"
        className="cursor-pointer pointer-events-auto"
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(link)
        }}
        onMouseEnter={(e) => onMouseEnter?.(link, e)}
        onMouseMove={(e) => onMouseMove?.(link, e)}
        onMouseLeave={(e) => onMouseLeave?.(link, e)}
      />
    </g>
  )
}
