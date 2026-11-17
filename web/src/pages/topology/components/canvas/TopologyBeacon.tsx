import React from 'react'
import { getSiteColor } from './siteColors'

export interface TopologyBeaconProps {
  x: number
  y: number
  site?: string
  nodeId?: string
  color?: string
  className?: string
}

/**
 * Renders concentric animated beacon rings for focused nodes.
 * Rendered on a dedicated SVG layer (Layer 3) between edges and node cards,
 * fulfilling Stylebook rule 3.5:
 * "Beacon vẽ trên layer riêng — thân node không thêm nét, không đổi màu."
 */
export const TopologyBeacon: React.FC<TopologyBeaconProps> = ({
  x,
  y,
  site,
  nodeId,
  color,
  className,
}) => {
  const beaconColor = color || (site ? getSiteColor(site) : '#38bdf8')

  return (
    <g
      className={className || 'topology-beacon-group pointer-events-none'}
      data-testid={nodeId ? `topology-beacon-${nodeId}` : 'topology-beacon'}
      data-node-id={nodeId}
    >
      {/* Outer subtle glow/pulse ring */}
      <circle
        cx={x}
        cy={y}
        r={52}
        fill="none"
        stroke={beaconColor}
        strokeWidth={1}
        strokeOpacity={0.2}
      />

      {/* Middle static beacon ring */}
      <circle
        cx={x}
        cy={y}
        r={44}
        fill="none"
        stroke={beaconColor}
        strokeWidth={1.2}
        strokeOpacity={0.4}
      />

      {/* Inner rotating dashed beacon ring centered exactly on (x, y) */}
      <circle
        cx={x}
        cy={y}
        r={36}
        fill="none"
        stroke={beaconColor}
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
  )
}
