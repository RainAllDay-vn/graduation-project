import type { DeviceStatus } from '@/api/topology'

export const SITE_COLORS: Record<string, string> = {
  'SITE-1': '#38bdf8', // Sky
  'SITE-2': '#a78bfa', // Violet
  'SITE-3': '#f472b6', // Pink
  'SITE-4': '#facc15', // Yellow
}

const EXTENDED_PALETTE = [
  '#2dd4bf', // Teal
  '#818cf8', // Indigo
  '#fb923c', // Orange
  '#4ade80', // Green
  '#c084fc', // Purple
  '#38bdf8', // Sky fallback
]

/**
 * Returns the hex color representing a site.
 * Follows stylebook rule 1.2: Fixed palette for SITE-1 to SITE-4,
 * and deterministic hue selection avoiding red/amber for other sites.
 */
export function getSiteColor(site?: string): string {
  if (!site) return '#64748b'
  const upper = site.toUpperCase().trim()
  if (SITE_COLORS[upper]) {
    return SITE_COLORS[upper]
  }

  // Hash-based deterministic selection for arbitrary site names
  let hash = 0
  for (let i = 0; i < upper.length; i++) {
    hash = (hash << 5) - hash + upper.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % EXTENDED_PALETTE.length
  return EXTENDED_PALETTE[index]
}

export interface NodeHealthColorStyle {
  fill: string
  text: string
  borderFallback?: string
}

/**
 * Returns health-coded fill and text colors for node body.
 * Follows stylebook rule 1.3:
 * - ACTIVE (healthy): dark slate #0f172a, blending into canvas.
 * - DEGRADED (warning): dark amber #78350f.
 * - CRITICAL / OFFLINE: dark red #991b1b.
 */
export function getNodeHealthColors(
  status: DeviceStatus,
  isDark = true
): NodeHealthColorStyle {
  switch (status) {
    case 'ACTIVE':
      return {
        fill: isDark ? '#0f172a' : '#ffffff',
        text: isDark ? '#f8fafc' : '#0f172a',
        borderFallback: isDark ? '#334155' : '#cbd5e1',
      }
    case 'DEGRADED':
      return {
        fill: isDark ? '#78350f' : '#fffbeb',
        text: isDark ? '#fef3c7' : '#92400e',
        borderFallback: '#f59e0b',
      }
    case 'CRITICAL':
    case 'OFFLINE':
      return {
        fill: isDark ? '#991b1b' : '#fef2f2',
        text: isDark ? '#ffffff' : '#991b1b',
        borderFallback: '#ef4444',
      }
    default:
      return {
        fill: isDark ? '#0f172a' : '#ffffff',
        text: isDark ? '#f8fafc' : '#0f172a',
      }
  }
}
