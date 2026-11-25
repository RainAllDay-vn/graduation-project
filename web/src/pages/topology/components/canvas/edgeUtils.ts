/**
 * Shortens telco interface names for compact edge port labels (e.g., HundredGig0/0/0/1 -> Hu0/0/0/1).
 */
export function formatShortPort(port?: string): string {
  if (!port) return ''
  return port
    .replace(/^HundredGig(E|abitEthernet)?/i, 'Hu')
    .replace(/^TenGig(E|abitEthernet)?/i, 'Te')
    .replace(/^Gig(abit)?Ethernet/i, 'Gi')
    .replace(/^FastEthernet/i, 'Fa')
    .replace(/^Ethernet/i, 'Eth')
}

export interface EdgeCoordinates {
  path: string
  startX: number
  startY: number
  endX: number
  endY: number
  sourceLabelPos: { x: number; y: number }
  targetLabelPos: { x: number; y: number }
}

/**
 * Evaluates coordinates (x, y) at parameter t along a cubic Bezier curve.
 */
export function evaluateCubicBezier(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const mt = 1 - t
  const mt2 = mt * mt
  const t2 = t * t
  const a = mt2 * mt
  const b = 3 * mt2 * t
  const c = 3 * mt * t2
  const d = t2 * t
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  }
}

/**
 * Computes smooth cubic bezier curve coordinates between two nodes.
 * Anchors properly at top or bottom borders of node cards to prevent clipping.
 * Also computes label positions along the curve to prevent port labels from colliding.
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

      const p0 = { x: startX, y: startY }
      const p1 = { x: startX, y: yMid }
      const p2 = { x: endX, y: yMid }
      const p3 = { x: endX, y: endY }

      const dist = Math.hypot(endX - startX, endY - startY)
      const tSource = dist > 0 ? Math.max(0.12, Math.min(0.28, 30 / dist)) : 0.16
      const tTarget = 1 - tSource
      const sourceLabelPos = evaluateCubicBezier(p0, p1, p2, p3, tSource)
      const targetLabelPos = evaluateCubicBezier(p0, p1, p2, p3, tTarget)

      return { path, startX, startY, endX, endY, sourceLabelPos, targetLabelPos }
    } else {
      // Source below target (upstream flow)
      const startX = source.x
      const startY = source.y - nodeHalfHeight
      const endX = target.x
      const endY = target.y + nodeHalfHeight
      const yMid = (startY + endY) / 2
      const path = `M ${startX},${startY} C ${startX},${yMid} ${endX},${yMid} ${endX},${endY}`

      const p0 = { x: startX, y: startY }
      const p1 = { x: startX, y: yMid }
      const p2 = { x: endX, y: yMid }
      const p3 = { x: endX, y: endY }

      const dist = Math.hypot(endX - startX, endY - startY)
      const tSource = dist > 0 ? Math.max(0.12, Math.min(0.28, 30 / dist)) : 0.16
      const tTarget = 1 - tSource
      const sourceLabelPos = evaluateCubicBezier(p0, p1, p2, p3, tSource)
      const targetLabelPos = evaluateCubicBezier(p0, p1, p2, p3, tTarget)

      return { path, startX, startY, endX, endY, sourceLabelPos, targetLabelPos }
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

  const p0 = { x: startX, y: startY }
  const p1 = { x: startX, y: ctrlY }
  const p2 = { x: endX, y: ctrlY }
  const p3 = { x: endX, y: endY }

  const dist = Math.hypot(endX - startX, archOffset * 1.5)
  const tSource = dist > 0 ? Math.max(0.12, Math.min(0.26, 32 / dist)) : 0.16
  const tTarget = 1 - tSource
  const sourceLabelPos = evaluateCubicBezier(p0, p1, p2, p3, tSource)
  const targetLabelPos = evaluateCubicBezier(p0, p1, p2, p3, tTarget)

  return { path, startX, startY, endX, endY, sourceLabelPos, targetLabelPos }
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
    return { stroke: '#1d4ed8', opacity: 1.0 } // Vibrant Blue highlight for selected link (Step 5.4)
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
