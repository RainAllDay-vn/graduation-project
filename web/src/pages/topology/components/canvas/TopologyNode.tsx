import React from 'react'
import type { DeviceSummary } from '@/api/topology'
import { cn } from '@/lib/utils'
import { getSiteColor } from './siteColors'

export interface TopologyNodeProps {
  node: DeviceSummary
  x: number
  y: number
  isSelected?: boolean
  isFocused?: boolean
  isHovered?: boolean
  isDimmed?: boolean
  isExpanded?: boolean
  locale?: 'vi' | 'en'
  onClick?: (node: DeviceSummary) => void
  onDoubleClick?: (node: DeviceSummary) => void
  onMouseEnter?: (node: DeviceSummary, event: React.MouseEvent<SVGGElement>) => void
  onMouseLeave?: (node: DeviceSummary, event: React.MouseEvent<SVGGElement>) => void
  onToggleExpand?: (nodeId: string) => void
  className?: string
}

export const TopologyNode: React.FC<TopologyNodeProps> = ({
  node,
  x,
  y,
  isSelected = false,
  isFocused = false,
  isHovered = false,
  isDimmed = false,
  isExpanded = false,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  onToggleExpand,
  className,
}) => {
  const siteColor = getSiteColor(node.site)
  const isHealthy = node.status === 'ACTIVE'
  const isWarning = node.status === 'DEGRADED'
  const isCritical = node.status === 'CRITICAL' || node.status === 'OFFLINE'

  const hasAccessLeaf =
    node.layer === 'EXCHANGE' || (node.accessDeviceCount && node.accessDeviceCount > 0)
  const hasAccessError = (node.accessErrorCount ?? 0) > 0

  const width = 76
  const height = 40
  const rx = 8
  const halfW = width / 2
  const halfH = height / 2

  // Badge pill geometry
  const badgeW = hasAccessError ? 66 : 54
  const badgeH = 17
  const badgeHalfW = badgeW / 2
  const badgeY = y + halfH + 2

  return (
    <g
      className={cn(
        'topology-node-group cursor-pointer select-none transition-opacity duration-200',
        isDimmed && 'opacity-20 pointer-events-none',
        className
      )}
      data-testid={`topology-node-${node.id}`}
      data-node-id={node.id}
      data-site={node.site}
      data-status={node.status}
      onClick={() => onClick?.(node)}
      onDoubleClick={() => onDoubleClick?.(node)}
      onMouseEnter={(e) => onMouseEnter?.(node, e)}
      onMouseLeave={(e) => onMouseLeave?.(node, e)}
    >
      {/* 1. Double Concentric Beacon Rings for Focused Nodes (Stylebook 3.5) */}
      {isFocused && (
        <g className="node-beacon-rings pointer-events-none">
          {/* Outer static beacon circle */}
          <circle
            cx={x}
            cy={y}
            r={48}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={1}
            strokeOpacity={0.35}
          />
          {/* Inner rotating dashed beacon circle centered exactly on node (x, y) */}
          <circle
            cx={x}
            cy={y}
            r={38}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={1.8}
            strokeDasharray="5 4"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${x} ${y}`}
              to={`360 ${x} ${y}`}
              dur="8s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}

      {/* 2. Selection Halo (Selected State) */}
      {isSelected && (
        <rect
          x={x - halfW - 4}
          y={y - halfH - 4}
          width={width + 8}
          height={height + 8}
          rx={rx + 3}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={2}
          strokeOpacity={0.7}
          className="animate-pulse pointer-events-none"
        />
      )}

      {/* 3. Node Body (Rectangle: Health Fill + Site Border) */}
      <rect
        x={x - halfW}
        y={y - halfH}
        width={width}
        height={height}
        rx={rx}
        style={{
          fill: isWarning ? '#78350f' : isCritical ? '#991b1b' : undefined,
          stroke: siteColor,
        }}
        className={cn(
          'transition-all duration-150',
          isHealthy && 'fill-white dark:fill-[#0f172a]',
          isHovered && 'brightness-110 drop-shadow-md'
        )}
        strokeWidth={isSelected ? 2.4 : 1.8}
      />

      {/* 4. Router ID Label (Monospace bold centered text) */}
      <text
        x={x}
        y={y + 3.8}
        textAnchor="middle"
        style={{
          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
          fill: isWarning ? '#fef3c7' : isCritical ? '#ffffff' : undefined,
        }}
        className={cn(
          'text-[11px] font-extrabold tracking-[0.04em] uppercase pointer-events-none',
          isHealthy && 'fill-slate-900 dark:fill-white'
        )}
      >
        {node.id}
      </text>

      {/* 5. Access Leaf Badge under Exchange Nodes (Stylebook 1.5) */}
      {hasAccessLeaf && (
        <g
          className="node-access-badge-group cursor-pointer"
          data-testid={`node-badge-${node.id}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand?.(node.id)
          }}
        >
          {/* Badge Container Pill */}
          <rect
            x={x - badgeHalfW}
            y={badgeY}
            width={badgeW}
            height={badgeH}
            rx={badgeH / 2}
            style={{
              fill: hasAccessError ? '#450a0a' : undefined,
              stroke: hasAccessError ? '#ef4444' : undefined,
            }}
            className={cn(
              'transition-colors duration-150',
              !hasAccessError &&
                'fill-slate-100 dark:fill-[#1e293b] stroke-slate-300 dark:stroke-[#475569]'
            )}
            strokeWidth={1}
          />

          {/* Badge Label */}
          <text
            x={x}
            y={badgeY + 11.5}
            textAnchor="middle"
            style={{
              fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
              fill: hasAccessError ? '#fca5a5' : undefined,
            }}
            className={cn(
              'text-[8.5px] font-bold pointer-events-none select-none tracking-wider',
              !hasAccessError && 'fill-slate-600 dark:fill-[#cbd5e1]'
            )}
          >
            {hasAccessError
              ? `${isExpanded ? '▲' : '▼'} +${node.accessDeviceCount || 0} | ${node.accessErrorCount}!`
              : `${isExpanded ? '▲ −' : '▼ +'}${node.accessDeviceCount || 0}`}
          </text>
        </g>
      )}
    </g>
  )
}
