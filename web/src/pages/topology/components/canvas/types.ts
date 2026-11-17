import type { DeviceLayer, DeviceSummary, LinkSummary } from '@/api/topology'
export type { LinkSummary }

export type TierLevel = 1 | 2 | 3 | 4

export interface TierDefinition {
  tier: TierLevel
  nameVi: string
  nameEn: string
  shortName: string
  y: number
  height: number
  layers: DeviceLayer[]
}

export interface NodePosition {
  id: string
  x: number
  y: number
  tier: TierLevel
  node: DeviceSummary
}

export interface NodeInteractionState {
  isSelected?: boolean
  isFocused?: boolean
  isHovered?: boolean
  isDimmed?: boolean
  isExpanded?: boolean
}

export interface EdgeInteractionState {
  isSelected?: boolean
  isHovered?: boolean
  isDimmed?: boolean
  isBlastRadius?: boolean
}

export interface CanvasDimensions {
  width: number
  height: number
  paddingX: number
  paddingY: number
}

export interface TierBound {
  tier: TierLevel
  nameVi: string
  nameEn: string
  shortName: string
  y: number
  height: number
  nodeCount: number
}

export interface StratifiedLayoutResult {
  nodePositions: Map<string, NodePosition>
  dimensions: CanvasDimensions
  tierBounds: TierBound[]
}

export interface ViewportTransform {
  x: number
  y: number
  k: number
}
