import type { DeviceLayer, DeviceSummary } from '@/api/topology'
import type {
  CanvasDimensions,
  NodePosition,
  StratifiedLayoutResult,
  TierBound,
  TierDefinition,
  TierLevel,
} from './types'

export const DEFAULT_CANVAS_DIMENSIONS: CanvasDimensions = {
  width: 1200,
  height: 680,
  paddingX: 80,
  paddingY: 24,
}

export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    tier: 1,
    nameVi: 'TẦNG 1 · BIÊN QUỐC TẾ & PEERING',
    nameEn: 'TIER 1 · PEERING & NATIONAL BORDER GATEWAY',
    shortName: 'PEERING & BORDER',
    y: 24,
    height: 140,
    layers: ['PEER', 'IGW'],
  },
  {
    tier: 2,
    nameVi: 'TẦNG 2 · XƯƠNG SỐNG LÕI TỈNH / VÙNG',
    nameEn: 'TIER 2 · PROVINCIAL CORE BACKBONE',
    shortName: 'CORE BACKBONE',
    y: 188,
    height: 140,
    layers: ['CORE'],
  },
  {
    tier: 3,
    nameVi: 'TẦNG 3 · TỔNG HỢP BIÊN',
    nameEn: 'TIER 3 · EDGE AGGREGATION',
    shortName: 'EDGE AGGREGATION',
    y: 352,
    height: 140,
    layers: ['AGGREGATION'],
  },
  {
    tier: 4,
    nameVi: 'TẦNG 4 · TRUNG TÂM METRO TỔNG ĐÀI',
    nameEn: 'TIER 4 · METRO EXCHANGE HUBS',
    shortName: 'METRO EXCHANGE',
    y: 516,
    height: 140,
    layers: ['EXCHANGE'],
  },
]

export const TIER_COLORS: Record<TierLevel, string> = {
  1: '#a855f7', // Purple
  2: '#f97316', // Orange
  3: '#06b6d4', // Cyan
  4: '#3b82f6', // Blue
}

/**
 * Maps a network device layer to its corresponding stratified tier level (1 to 4).
 */
export function getTierForLayer(layer: DeviceLayer): TierLevel {
  switch (layer) {
    case 'PEER':
    case 'IGW':
      return 1
    case 'CORE':
      return 2
    case 'AGGREGATION':
      return 3
    case 'EXCHANGE':
    case 'ACCESS':
      return 4
    default:
      return 3
  }
}

/**
 * Retrieves the tier definition for a given tier level.
 */
export function getTierDefinition(tier: TierLevel): TierDefinition {
  const found = TIER_DEFINITIONS.find((def) => def.tier === tier)
  if (!found) {
    return TIER_DEFINITIONS[2] // Fallback to Tier 3
  }
  return found
}

export interface ComputeLayoutOptions {
  width?: number
  height?: number
  paddingX?: number
  paddingY?: number
}

/**
 * Computes deterministic, tier-invariant coordinates for network nodes across 5 stratified bands.
 * Nodes within each tier are grouped by site and ordered by ID to eliminate edge tangling.
 */
export function computeStratifiedLayout(
  nodes: DeviceSummary[] = [],
  options: ComputeLayoutOptions = {}
): StratifiedLayoutResult {
  const dimensions: CanvasDimensions = {
    width: options.width ?? DEFAULT_CANVAS_DIMENSIONS.width,
    height: options.height ?? DEFAULT_CANVAS_DIMENSIONS.height,
    paddingX: options.paddingX ?? DEFAULT_CANVAS_DIMENSIONS.paddingX,
    paddingY: options.paddingY ?? DEFAULT_CANVAS_DIMENSIONS.paddingY,
  }

  const nodePositions = new Map<string, NodePosition>()
  const tierBounds: TierBound[] = []

  // Group nodes by tier
  const tierMap = new Map<TierLevel, DeviceSummary[]>()
  for (const def of TIER_DEFINITIONS) {
    tierMap.set(def.tier, [])
  }

  for (const node of nodes) {
    const tier = getTierForLayer(node.layer)
    const list = tierMap.get(tier)
    if (list) {
      list.push(node)
    }
  }

  // Calculate layout per tier
  for (const def of TIER_DEFINITIONS) {
    const tierNodes = tierMap.get(def.tier) ?? []

    // Sort nodes deterministically by site first, then id
    tierNodes.sort((a, b) => {
      const siteCompare = (a.site || '').localeCompare(b.site || '')
      if (siteCompare !== 0) return siteCompare
      return (a.id || '').localeCompare(b.id || '')
    })

    const count = tierNodes.length
    tierBounds.push({
      tier: def.tier,
      nameVi: def.nameVi,
      nameEn: def.nameEn,
      shortName: def.shortName,
      y: def.y,
      height: def.height,
      nodeCount: count,
    })

    const centerY = def.y + def.height / 2
    const availableWidth = Math.max(100, dimensions.width - dimensions.paddingX * 2)

    if (count === 1) {
      const node = tierNodes[0]
      nodePositions.set(node.id, {
        id: node.id,
        x: dimensions.width / 2,
        y: centerY,
        tier: def.tier,
        node,
      })
    } else if (count > 1) {
      const step = availableWidth / (count + 1)
      tierNodes.forEach((node, index) => {
        const x = dimensions.paddingX + step * (index + 1)
        nodePositions.set(node.id, {
          id: node.id,
          x,
          y: centerY,
          tier: def.tier,
          node,
        })
      })
    }
  }

  return {
    nodePositions,
    dimensions,
    tierBounds,
  }
}
