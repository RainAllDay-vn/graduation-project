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
 * Topology Beacon Component (Step 5.2 & Stylebook §3.5)
 *
 * Renders high-visibility double concentric beacon rings with radar ripple pulse
 * animations on a dedicated SVG layer (Layer 3) directly underneath node cards
 * and above incoming edges.
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
  const coreAccent = '#1d4ed8'

  return (
    <g
      className={className || 'topology-beacon-group pointer-events-none select-none'}
      data-testid={nodeId ? `topology-beacon-${nodeId}` : 'topology-beacon'}
      data-node-id={nodeId}
    >
      {/* 1. Radar Ripple Ring 1 (continuous expanding pulse wave) */}
      <circle
        cx={x}
        cy={y}
        r={36}
        fill="none"
        stroke={beaconColor}
        strokeWidth={2}
      >
        <animate
          attributeName="r"
          values="36;54;66"
          dur="2.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-opacity"
          values="0.85;0.35;0"
          dur="2.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-width"
          values="2;1.2;0.5"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 2. Radar Ripple Ring 2 (staggered phase by 1.2s for continuous wave echo) */}
      <circle
        cx={x}
        cy={y}
        r={36}
        fill="none"
        stroke={beaconColor}
        strokeWidth={2}
      >
        <animate
          attributeName="r"
          values="36;54;66"
          begin="1.2s"
          dur="2.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-opacity"
          values="0.85;0.35;0"
          begin="1.2s"
          dur="2.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-width"
          values="2;1.2;0.5"
          begin="1.2s"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 3. Outer Concentric Static Ring */}
      <circle
        cx={x}
        cy={y}
        r={48}
        fill="none"
        stroke={beaconColor}
        strokeWidth={1.2}
        strokeOpacity={0.4}
        strokeDasharray="4 3"
      />

      {/* 4. Concentric Rotating Dashed Reticle Ring */}
      <circle
        cx={x}
        cy={y}
        r={40}
        fill="none"
        stroke="#38bdf8"
        strokeWidth={1.8}
        strokeDasharray="6 4"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${x} ${y}`}
          to={`360 ${x} ${y}`}
          dur="6s"
          repeatCount="indefinite"
        />
      </circle>

      {/* 5. Inner Core Accent Ring (#1d4ed8) */}
      <circle
        cx={x}
        cy={y}
        r={33}
        fill="none"
        stroke={coreAccent}
        strokeWidth={1.5}
        strokeOpacity={0.7}
      />

      {/* 6. Precision Crosshair Target Ticks */}
      <line x1={x - 44} y1={y} x2={x - 36} y2={y} stroke="#38bdf8" strokeWidth={1.5} strokeOpacity={0.75} />
      <line x1={x + 36} y1={y} x2={x + 44} y2={y} stroke="#38bdf8" strokeWidth={1.5} strokeOpacity={0.75} />
      <line x1={x} y1={y - 44} x2={x} y2={y - 36} stroke="#38bdf8" strokeWidth={1.5} strokeOpacity={0.75} />
      <line x1={x} y1={y + 36} x2={x} y2={y + 44} stroke="#38bdf8" strokeWidth={1.5} strokeOpacity={0.75} />
    </g>
  )
}
