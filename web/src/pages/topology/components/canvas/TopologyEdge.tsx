import React from 'react'
import type { LinkSummary } from '@/api/topology'
import { cn } from '@/lib/utils'
import {
  computeEdgeCoordinates,
  formatShortPort,
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
  isIncidentMode?: boolean
  isLodFar?: boolean
  showPortAnchors?: boolean
  showPortLabels?: boolean
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
  isIncidentMode = false,
  isLodFar = false,
  showPortAnchors = true,
  showPortLabels = true,
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

  const upperStatus = (link.operStatus || '').toUpperCase().trim()
  const isFaultLink =
    upperStatus === 'DOWN' ||
    upperStatus === 'CRITICAL' ||
    upperStatus === 'FAULT' ||
    upperStatus === 'ERROR' ||
    upperStatus === 'DEGRADED'

  const shortSourcePort = formatShortPort(link.sourcePort)
  const shortTargetPort = formatShortPort(link.targetPort)

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

      {/* 1b. Incident Mode Red Pulsing Fault Halo (Stylebook §5.6) */}
      {isIncidentMode && isFaultLink && !isLodFar && (
        <path
          d={coords.path}
          fill="none"
          stroke="#ef4444"
          strokeWidth={strokeWidth + 4.5}
          strokeOpacity={0.5}
          strokeLinecap="round"
          data-testid={`fault-pulse-${link.linkId}`}
          className="animate-pulse pointer-events-none"
        />
      )}

      {/* 2. Blast Radius Warning Path (Incident Mode — Orange dashed halo) */}
      {isBlastRadius && (
        <path
          d={coords.path}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={strokeWidth + 2.5}
          strokeDasharray="6 4"
          strokeOpacity={0.85}
          strokeLinecap="round"
          data-testid={`blast-radius-path-${link.linkId}`}
          className={cn('pointer-events-none', isIncidentMode && 'animate-pulse')}
        />
      )}

      {/* 3. Primary Physical Fiber Edge Line (Stylebook §3.2: hairline in LOD far) */}
      <path
        d={coords.path}
        fill="none"
        stroke={colorStyle.stroke}
        strokeWidth={isLodFar ? 1.2 : isHovered ? strokeWidth + 1.2 : strokeWidth}
        strokeOpacity={isHovered ? 1.0 : isLodFar ? 0.75 : colorStyle.opacity}
        strokeDasharray={isLodFar ? undefined : dashArray}
        strokeLinecap="round"
        className={cn(
          'transition-all duration-200 pointer-events-none',
          isHovered && 'filter drop-shadow-[0_0_4px_rgba(56,189,248,0.5)]'
        )}
      />

      {/* 4. Physical Port Anchor Dots (Stylebook rule 2.1 & 3.2: hidden in LOD far) */}
      {!isLodFar && showPortAnchors && (
        <g className="port-anchors pointer-events-none transition-opacity duration-200">
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

      {/* 4b. Physical Port Text Labels (Solution 1: Offset along Bezier curve to prevent node clamping) */}
      {!isLodFar && showPortLabels && (shortSourcePort || shortTargetPort) && (
        <g className="port-labels pointer-events-none transition-opacity duration-200" data-testid={`port-labels-${link.linkId}`}>
          {shortSourcePort && coords.sourceLabelPos && (
            <g
              transform={`translate(${coords.sourceLabelPos.x}, ${coords.sourceLabelPos.y})`}
              className="select-none"
            >
              <rect
                x={-Math.max(22, shortSourcePort.length * 5.2 + 8) / 2}
                y={-6}
                width={Math.max(22, shortSourcePort.length * 5.2 + 8)}
                height={12}
                rx={2.5}
                className={cn(
                  'fill-white/95 dark:fill-[#0f172a]/95 stroke-slate-200 dark:stroke-slate-700/80 shadow-xs transition-colors',
                  (isHovered || isSelected) && 'stroke-sky-400 dark:stroke-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.4)]'
                )}
                strokeWidth={0.75}
              />
              <text
                x={0}
                y={3}
                textAnchor="middle"
                className={cn(
                  'font-mono text-[7.5px] font-bold fill-slate-600 dark:fill-slate-300 transition-colors',
                  (isHovered || isSelected) && 'fill-sky-600 dark:fill-sky-300'
                )}
                style={{ fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)' }}
              >
                {shortSourcePort}
              </text>
            </g>
          )}
          {shortTargetPort && coords.targetLabelPos && (
            <g
              transform={`translate(${coords.targetLabelPos.x}, ${coords.targetLabelPos.y})`}
              className="select-none"
            >
              <rect
                x={-Math.max(22, shortTargetPort.length * 5.2 + 8) / 2}
                y={-6}
                width={Math.max(22, shortTargetPort.length * 5.2 + 8)}
                height={12}
                rx={2.5}
                className={cn(
                  'fill-white/95 dark:fill-[#0f172a]/95 stroke-slate-200 dark:stroke-slate-700/80 shadow-xs transition-colors',
                  (isHovered || isSelected) && 'stroke-sky-400 dark:stroke-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.4)]'
                )}
                strokeWidth={0.75}
              />
              <text
                x={0}
                y={3}
                textAnchor="middle"
                className={cn(
                  'font-mono text-[7.5px] font-bold fill-slate-600 dark:fill-slate-300 transition-colors',
                  (isHovered || isSelected) && 'fill-sky-600 dark:fill-sky-300'
                )}
                style={{ fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)' }}
              >
                {shortTargetPort}
              </text>
            </g>
          )}
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
