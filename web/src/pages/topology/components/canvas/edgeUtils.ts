export interface EdgeCoordinates {
  path: string
  startX: number
  startY: number
  endX: number
  endY: number
}

/**
 * Computes smooth cubic bezier curve coordinates between two nodes.
 * Anchors properly at top or bottom borders of node cards to prevent clipping.
 */
export function computeEdgeCoordinates(
  source: { x: number; y: number },
  target: { x: number; y: number },
  _nodeHalfWidth = 38,
  nodeHalfHeight = 20
): EdgeCoordinates {
  const dy = target.y - source.y
  const dx = target.x - source.x

  // Vertical tier crossing (e.g., Tier 1 -> Tier 2)
  if (Math.abs(dy) > 12) {
    if (dy > 0) {
      // Source above target (downstream flow)
      const startX = source.x
      const startY = source.y + nodeHalfHeight
      const endX = target.x
      const endY = target.y - nodeHalfHeight
      const yMid = (startY + endY) / 2
      const path = `M ${startX},${startY} C ${startX},${yMid} ${endX},${yMid} ${endX},${endY}`
      return { path, startX, startY, endX, endY }
    } else {
      // Source below target (upstream flow)
      const startX = source.x
      const startY = source.y - nodeHalfHeight
      const endX = target.x
      const endY = target.y + nodeHalfHeight
      const yMid = (startY + endY) / 2
      const path = `M ${startX},${startY} C ${startX},${yMid} ${endX},${yMid} ${endX},${endY}`
      return { path, startX, startY, endX, endY }
    }
  }

  // Same tier horizontal connection (e.g. CORE-01 <-> CORE-02 ring)
  const startX = source.x
  const startY = source.y - nodeHalfHeight
  const endX = target.x
  const endY = target.y - nodeHalfHeight
  // Arch cleanly above both nodes
  const archOffset = Math.min(60, Math.max(30, Math.abs(dx) * 0.22))
  const ctrlY = startY - archOffset
  const path = `M ${startX},${startY} C ${startX},${ctrlY} ${endX},${ctrlY} ${endX},${endY}`
  return { path, startX, startY, endX, endY }
}

export interface EdgeColorStyle {
  stroke: string
  opacity: number
}

/**
 * Returns color and opacity based on link health status (Stylebook rule 2.2).
 */
export function getEdgeHealthColor(
  status?: string,
  options?: { isSelected?: boolean; isBlastRadius?: boolean }
): EdgeColorStyle {
  if (options?.isBlastRadius) {
    return { stroke: '#f59e0b', opacity: 0.95 } // Amber pulsing blast radius
  }

  if (options?.isSelected) {
    return { stroke: '#38bdf8', opacity: 1.0 } // Sky selected highlight
  }

  const upper = (status || '').toUpperCase().trim()

  // Critical / Down / Fault
  if (
    upper === 'DOWN' ||
    upper === 'CRITICAL' ||
    upper === 'FAULT' ||
    upper === 'ERROR'
  ) {
    return { stroke: '#ef4444', opacity: 0.95 }
  }

  // Degraded / Warning
  if (upper === 'DEGRADED' || upper === 'WARNING' || upper === 'WARN') {
    return { stroke: '#f59e0b', opacity: 0.85 }
  }

  // Healthy / Normal (Emerald #10b981)
  return { stroke: '#10b981', opacity: 0.65 }
}

/**
 * Maps installed capacity to stroke thickness in 3 fixed tiers (Stylebook rule 2.3).
 * - Bậc mảnh: < 10 Gbps -> 1.5px
 * - Bậc trung: 10 Gbps <= cap < 100 Gbps -> 2.5px
 * - Bậc dày: >= 100 Gbps -> 3.8px
 */
export function getEdgeStrokeWidth(capacityGbps?: number): number {
  if (!capacityGbps || capacityGbps < 10) {
    return 1.5
  }
  if (capacityGbps < 100) {
    return 2.5
  }
  return 3.8
}

/**
 * Maps bandwidth utilization to stroke dasharray (Stylebook rule 2.4).
 * - Ít sử dụng (< 15% or backup link) -> "2 8"
 * - Trung bình (15% <= util < 70%) -> "7 3.5"
 * - Sử dụng đầy (>= 70%) -> solid line (undefined)
 */
export function getEdgeDashArray(
  utilizationPercent?: number,
  isBackup?: boolean
): string | undefined {
  if (isBackup || (utilizationPercent !== undefined && utilizationPercent < 15)) {
    return '2 8'
  }
  if (utilizationPercent !== undefined && utilizationPercent < 70) {
    return '7 3.5'
  }
  return undefined
}
