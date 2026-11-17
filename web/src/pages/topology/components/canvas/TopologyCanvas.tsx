import React, { useMemo, useState } from 'react'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import { cn } from '@/lib/utils'
import { computeStratifiedLayout } from './layoutEngine'
import { SiteLegend } from './SiteLegend'
import { TierBands } from './TierBands'
import { TopologyBeacon } from './TopologyBeacon'
import { TopologyEdge } from './TopologyEdge'
import { TopologyNode } from './TopologyNode'
import type { StratifiedLayoutResult } from './types'
import { ViewportControls } from './ViewportControls'

export interface TopologyCanvasProps {
  nodes?: DeviceSummary[]
  links?: LinkSummary[]
  width?: number
  height?: number
  paddingX?: number
  paddingY?: number
  locale?: 'vi' | 'en'
  showCenterlines?: boolean
  showCounts?: boolean
  showPortAnchors?: boolean
  showLegend?: boolean
  showControls?: boolean
  selectedSite?: string | null
  onSiteClick?: (site: string) => void
  selectedNodeId?: string
  focusedNodeIds?: string[]
  focusNodeId?: string
  expandedNodeIds?: string[]
  dimmedNodeIds?: string[]
  hoveredNodeId?: string
  selectedLinkId?: string
  dimmedLinkIds?: string[]
  blastRadiusLinkIds?: string[]
  hoveredLinkId?: string
  zoom?: number
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFit?: () => void
  onSelectNode?: (node: DeviceSummary) => void
  onFocusNode?: (node: DeviceSummary) => void
  onToggleExpandNode?: (nodeId: string) => void
  onNodeHover?: (node: DeviceSummary | null, event?: React.MouseEvent) => void
  onSelectLink?: (link: LinkSummary) => void
  onLinkHover?: (link: LinkSummary | null, event?: React.MouseEvent) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode | ((layout: StratifiedLayoutResult) => React.ReactNode)
}

export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({
  nodes = [],
  links = [],
  width,
  height,
  paddingX,
  paddingY,
  locale = 'vi',
  showCenterlines = true,
  showCounts = true,
  showPortAnchors = true,
  showLegend = true,
  showControls = true,
  selectedSite: externalSelectedSite,
  onSiteClick: externalOnSiteClick,
  selectedNodeId,
  focusedNodeIds,
  focusNodeId,
  expandedNodeIds,
  dimmedNodeIds: explicitDimmedNodeIds,
  hoveredNodeId: externalHoveredNodeId,
  selectedLinkId,
  dimmedLinkIds: explicitDimmedLinkIds,
  blastRadiusLinkIds,
  hoveredLinkId: externalHoveredLinkId,
  zoom,
  onZoomIn,
  onZoomOut,
  onFit,
  onSelectNode,
  onFocusNode,
  onToggleExpandNode,
  onNodeHover,
  onSelectLink,
  onLinkHover,
  className,
  style,
  children,
}) => {
  const [internalHoveredNodeId, setInternalHoveredNodeId] = useState<string | null>(null)
  const [internalHoveredLinkId, setInternalHoveredLinkId] = useState<string | null>(null)
  const [internalSelectedSite, setInternalSelectedSite] = useState<string | null>(null)

  const activeHoveredNodeId = externalHoveredNodeId ?? internalHoveredNodeId
  const activeHoveredLinkId = externalHoveredLinkId ?? internalHoveredLinkId
  const activeSelectedSite =
    externalSelectedSite !== undefined ? externalSelectedSite : internalSelectedSite

  const handleSiteClick = (site: string) => {
    if (externalOnSiteClick) {
      externalOnSiteClick(site)
    } else {
      setInternalSelectedSite((prev) => (prev === site ? null : site))
    }
  }

  // Pre-calculate site device counts for legend display
  const siteCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    nodes.forEach((n) => {
      if (n.site) {
        counts[n.site] = (counts[n.site] || 0) + 1
      }
    })
    return counts
  }, [nodes])

  // Derive dimmed nodes based on active site quick-focus (Stylebook §4.4)
  const effectiveDimmedNodeIds = useMemo(() => {
    const set = new Set(explicitDimmedNodeIds ?? [])
    if (activeSelectedSite) {
      nodes.forEach((n) => {
        if (n.site?.toUpperCase() !== activeSelectedSite.toUpperCase()) {
          set.add(n.id)
        }
      })
    }
    return set
  }, [explicitDimmedNodeIds, activeSelectedSite, nodes])

  // Derive dimmed links based on active site quick-focus
  const effectiveDimmedLinkIds = useMemo(() => {
    const set = new Set(explicitDimmedLinkIds ?? [])
    if (activeSelectedSite) {
      links.forEach((l) => {
        const sNode = nodes.find((n) => n.id === l.sourceDeviceId)
        const tNode = nodes.find((n) => n.id === l.targetDeviceId)
        const sSite = sNode?.site?.toUpperCase()
        const tSite = tNode?.site?.toUpperCase()
        const targetSite = activeSelectedSite.toUpperCase()
        // If neither endpoint is in the selected site, dim the link
        if (sSite !== targetSite && tSite !== targetSite) {
          set.add(l.linkId)
        }
      })
    }
    return set
  }, [explicitDimmedLinkIds, activeSelectedSite, links, nodes])

  const layout = useMemo(
    () =>
      computeStratifiedLayout(nodes, {
        width,
        height,
        paddingX,
        paddingY,
      }),
    [nodes, width, height, paddingX, paddingY]
  )

  const { dimensions, tierBounds, nodePositions } = layout

  // Focused node IDs list for Layer 3 beacon rings
  const activeFocusedNodeIds = useMemo(() => {
    const ids = new Set<string>(focusedNodeIds ?? [])
    if (focusNodeId) ids.add(focusNodeId)
    return ids
  }, [focusedNodeIds, focusNodeId])

  return (
    <div
      className={cn(
        'relative w-full h-full min-w-0 min-h-0 overflow-hidden select-none',
        'bg-[#f8fafc] dark:bg-[#0b0f19] text-[#0f172a] dark:text-[#f8fafc]',
        className
      )}
      style={style}
      data-testid="topology-canvas"
    >
      {/* SVG Canvas Root */}
      <svg
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-full block"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Stratified Network Topology Canvas"
      >
        {/* Layer 1: Stratified Tier Bands (Guidelines & Dashed Enclosures) */}
        <TierBands
          tierBounds={tierBounds}
          dimensions={dimensions}
          locale={locale}
          showCenterlines={showCenterlines}
          showCounts={showCounts}
        />

        {/* Layer 2: Physical & Logical Inter-tier Links (Edges behind nodes) */}
        <g className="topology-edges-layer" data-testid="topology-edges-layer">
          {links.map((link) => {
            const sourcePos = nodePositions.get(link.sourceDeviceId)
            const targetPos = nodePositions.get(link.targetDeviceId)

            if (!sourcePos || !targetPos) return null

            const isSelected = selectedLinkId === link.linkId
            const isHovered = activeHoveredLinkId === link.linkId
            const isDimmed = effectiveDimmedLinkIds.has(link.linkId)
            const isBlastRadius = blastRadiusLinkIds?.includes(link.linkId)

            return (
              <TopologyEdge
                key={link.linkId}
                link={link}
                sourcePos={sourcePos}
                targetPos={targetPos}
                isSelected={isSelected}
                isHovered={isHovered}
                isDimmed={isDimmed}
                isBlastRadius={isBlastRadius}
                showPortAnchors={showPortAnchors}
                onClick={onSelectLink}
                onMouseEnter={(l, e) => {
                  setInternalHoveredLinkId(l.linkId)
                  onLinkHover?.(l, e)
                }}
                onMouseLeave={(_l, e) => {
                  setInternalHoveredLinkId(null)
                  onLinkHover?.(null, e)
                }}
              />
            )
          })}
        </g>

        {/* Layer 3: Concentric Beacon Rings for Focused Nodes (Stylebook §3.5: Layer riêng) */}
        <g className="topology-beacons-layer" data-testid="topology-beacons-layer">
          {Array.from(nodePositions.values())
            .filter((pos) => activeFocusedNodeIds.has(pos.id))
            .map((pos) => (
              <TopologyBeacon
                key={`beacon-${pos.id}`}
                x={pos.x}
                y={pos.y}
                site={pos.node.site}
                nodeId={pos.id}
              />
            ))}
        </g>

        {/* Layer 4: Network Node Cards (Positioned atop edges & beacon rings) */}
        <g className="topology-nodes-layer" data-testid="topology-nodes-layer">
          {Array.from(nodePositions.values()).map((pos) => {
            const isSelected = selectedNodeId === pos.id
            const isFocused = activeFocusedNodeIds.has(pos.id)
            const isExpanded = expandedNodeIds?.includes(pos.id)
            const isDimmed = effectiveDimmedNodeIds.has(pos.id)
            const isHovered = activeHoveredNodeId === pos.id

            return (
              <TopologyNode
                key={pos.id}
                node={pos.node}
                x={pos.x}
                y={pos.y}
                isSelected={isSelected}
                isFocused={isFocused}
                renderBeacon={false} // Beacon rendered on dedicated Layer 3
                isExpanded={isExpanded}
                isDimmed={isDimmed}
                isHovered={isHovered}
                locale={locale}
                onClick={onSelectNode}
                onDoubleClick={onFocusNode}
                onMouseEnter={(node, e) => {
                  setInternalHoveredNodeId(node.id)
                  onNodeHover?.(node, e)
                }}
                onMouseLeave={(_node, e) => {
                  setInternalHoveredNodeId(null)
                  onNodeHover?.(null, e)
                }}
                onToggleExpand={onToggleExpandNode}
              />
            )
          })}
        </g>

        {/* Layer 5: Custom SVG Overlays / Visual Annotations Slot */}
        {typeof children === 'function' ? children(layout) : children}
      </svg>

      {/* HTML Floating Overlay 1: Top-Right Viewport Controls (Stylebook §0.1 & §3.2) */}
      {showControls && (
        <ViewportControls
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onFit={onFit}
        />
      )}

      {/* HTML Floating Overlay 2: Bottom-Left Site Legend & Quick Focus (Stylebook §0.1 & §4.4) */}
      {showLegend && (
        <SiteLegend
          selectedSite={activeSelectedSite}
          onSiteClick={handleSiteClick}
          siteCounts={siteCounts}
        />
      )}
    </div>
  )
}
