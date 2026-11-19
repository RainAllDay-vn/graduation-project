import React, { useEffect, useImperativeHandle, useMemo, useState, forwardRef } from 'react'
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
import { usePanZoom, type PanZoomTransform } from './usePanZoom'
import { computeEgoNetwork, type KHopDistance, type KHopFilterMode } from './egoNetwork'
import { KHopControls } from './KHopControls'
import { TopologyTooltip, type TooltipTarget } from './TopologyTooltip'
import { useNodeDrag } from './useNodeDrag'

export interface TopologyCanvasHandle {
  panToNode: (nodeId: string) => void
  panToPoint: (x: number, y: number) => void
  resetZoom: () => void
  zoomIn: () => void
  zoomOut: () => void
}

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
  showKHopControls?: boolean
  showTooltip?: boolean
  lod?: 'auto' | 'near' | 'far'
  lodThreshold?: number
  kHop?: KHopDistance
  filterMode?: KHopFilterMode
  onKHopChange?: (kHop: KHopDistance) => void
  onFilterModeChange?: (mode: KHopFilterMode) => void
  selectedSite?: string | null
  onSiteClick?: (site: string) => void
  selectedNodeId?: string
  centerNodeId?: string | null
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
  pan?: { x: number; y: number }
  minZoom?: number
  maxZoom?: number
  onTransformChange?: (transform: PanZoomTransform) => void
  disablePanZoom?: boolean
  disableNodeDrag?: boolean
  onNodePositionChange?: (nodeId: string, pos: { x: number; y: number }) => void
  onResetPositions?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFit?: () => void
  onSelectNode?: (node: DeviceSummary) => void
  onFocusNode?: (node: DeviceSummary) => void
  onClearFocus?: () => void
  onToggleExpandNode?: (nodeId: string) => void
  onNodeHover?: (node: DeviceSummary | null, event?: React.MouseEvent) => void
  onSelectLink?: (link: LinkSummary) => void
  onLinkHover?: (link: LinkSummary | null, event?: React.MouseEvent) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode | ((layout: StratifiedLayoutResult) => React.ReactNode)
}

export const TopologyCanvas = forwardRef<TopologyCanvasHandle, TopologyCanvasProps>(({
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
  showKHopControls = true,
  showTooltip = true,
  lod = 'auto',
  lodThreshold = 0.8,
  kHop: externalKHop,
  filterMode: externalFilterMode = 'ghost',
  onKHopChange: externalOnKHopChange,
  onFilterModeChange: externalOnFilterModeChange,
  selectedSite: externalSelectedSite,
  onSiteClick: externalOnSiteClick,
  selectedNodeId,
  centerNodeId,
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
  pan,
  minZoom,
  maxZoom,
  onTransformChange,
  disablePanZoom,
  disableNodeDrag,
  onNodePositionChange,
  onResetPositions,
  onZoomIn,
  onZoomOut,
  onFit,
  onSelectNode,
  onFocusNode,
  onClearFocus,
  onToggleExpandNode,
  onNodeHover,
  onSelectLink,
  onLinkHover,
  className,
  style,
  children,
}, ref) => {
  const [internalHoveredNodeId, setInternalHoveredNodeId] = useState<string | null>(null)
  const [internalHoveredLinkId, setInternalHoveredLinkId] = useState<string | null>(null)
  const [internalSelectedSite, setInternalSelectedSite] = useState<string | null>(null)
  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState<string | null>(null)
  const [internalSelectedLinkId, setInternalSelectedLinkId] = useState<string | null>(null)
  const [tooltipTarget, setTooltipTarget] = useState<TooltipTarget>(null)
  // Stylebook §3.5: Support multiple beacons simultaneously
  const [internalFocusedNodeIds, setInternalFocusedNodeIds] = useState<Set<string>>(() => {
    const s = new Set<string>(focusedNodeIds ?? [])
    if (focusNodeId) s.add(focusNodeId)
    return s
  })
  const [internalKHop, setInternalKHop] = useState<KHopDistance>(externalKHop ?? 2)
  const [internalFilterMode, setInternalFilterMode] = useState<KHopFilterMode>(externalFilterMode)

  const activeHoveredNodeId = externalHoveredNodeId ?? internalHoveredNodeId
  const activeHoveredLinkId = externalHoveredLinkId ?? internalHoveredLinkId
  const activeSelectedSite =
    externalSelectedSite !== undefined ? externalSelectedSite : internalSelectedSite
  const activeSelectedNodeId =
    selectedNodeId !== undefined ? selectedNodeId : internalSelectedNodeId
  const activeSelectedLinkId =
    selectedLinkId !== undefined ? selectedLinkId : internalSelectedLinkId

  // Synchronize internalFocusedNodeIds when controlled props change
  React.useEffect(() => {
    if (focusedNodeIds !== undefined || focusNodeId !== undefined) {
      const s = new Set<string>(focusedNodeIds ?? [])
      if (focusNodeId) s.add(focusNodeId)
      setInternalFocusedNodeIds(s)
    }
  }, [focusedNodeIds, focusNodeId])

  const activeFocusedNodeIds = useMemo(() => {
    if (focusedNodeIds !== undefined) {
      const s = new Set<string>(focusedNodeIds)
      if (focusNodeId) s.add(focusNodeId)
      return s
    }
    return internalFocusedNodeIds
  }, [focusedNodeIds, focusNodeId, internalFocusedNodeIds])

  const activeKHop = externalKHop !== undefined ? externalKHop : internalKHop
  const activeFilterMode = externalFilterMode !== undefined ? externalFilterMode : internalFilterMode

  const handleKHopChange = (newKHop: KHopDistance) => {
    if (externalOnKHopChange) {
      externalOnKHopChange(newKHop)
    } else {
      setInternalKHop(newKHop)
    }
  }

  const handleFilterModeChange = (newMode: KHopFilterMode) => {
    if (externalOnFilterModeChange) {
      externalOnFilterModeChange(newMode)
    } else {
      setInternalFilterMode(newMode)
    }
  }

  const handleClearFocus = () => {
    setInternalFocusedNodeIds(new Set())
    onClearFocus?.()
  }

  // Stylebook §3.5: Multi-source BFS Ego-Network runs strictly around active BEACONS (focused nodes)
  const egoNetwork = useMemo(() => {
    return computeEgoNetwork(activeFocusedNodeIds, nodes, links, activeKHop, activeFilterMode)
  }, [activeFocusedNodeIds, nodes, links, activeKHop, activeFilterMode])

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

  // Derive dimmed nodes based on active site quick-focus (Stylebook §4.4) & BFS Ego-Network (Stylebook §3.5)
  const effectiveDimmedNodeIds = useMemo(() => {
    const set = new Set(explicitDimmedNodeIds ?? [])
    // 1. Site Quick-Focus Dimming
    if (activeSelectedSite) {
      nodes.forEach((n) => {
        if (n.site?.toUpperCase() !== activeSelectedSite.toUpperCase()) {
          set.add(n.id)
        }
      })
    }
    // 2. BFS Ego-Network k-Hop Dimming (Stylebook §3.5: only active when at least one beacon exists)
    if (activeKHop !== 'all' && egoNetwork.dimmedNodeIds.size > 0) {
      egoNetwork.dimmedNodeIds.forEach((id) => set.add(id))
    }
    return set
  }, [explicitDimmedNodeIds, activeSelectedSite, nodes, activeKHop, egoNetwork.dimmedNodeIds])

  // Derive dimmed links based on active site quick-focus & BFS Ego-Network (Stylebook §3.5)
  const effectiveDimmedLinkIds = useMemo(() => {
    const set = new Set(explicitDimmedLinkIds ?? [])
    // 1. Site Quick-Focus Dimming
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
    // 2. BFS Ego-Network k-Hop Dimming (Stylebook §3.5)
    if (activeKHop !== 'all' && egoNetwork.dimmedLinkIds.size > 0) {
      egoNetwork.dimmedLinkIds.forEach((id) => set.add(id))
    }
    return set
  }, [explicitDimmedLinkIds, activeSelectedSite, links, nodes, activeKHop, egoNetwork.dimmedLinkIds])

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
  const panZoomGroupRef = React.useRef<SVGGElement | null>(null)

  // Step 5.1: Pan & Zoom Engine
  const {
    transform,
    isPanning,
    isTransitioning,
    containerRef,
    svgRef,
    zoomIn,
    zoomOut,
    resetZoom,
    panToPoint,
    handleMouseDown,
    handleDoubleClick,
    canZoomIn,
    canZoomOut,
  } = usePanZoom({
    minZoom,
    maxZoom,
    initialTransform:
      zoom !== undefined || pan !== undefined
        ? { x: pan?.x ?? 0, y: pan?.y ?? 0, k: zoom ?? 1 }
        : undefined,
    dimensions,
    onTransformChange,
    disabled: disablePanZoom,
  })

  // Step 5.5: Interactive Node Dragging (Stylebook §3.3)
  const {
    effectiveNodePositions,
    hasCustomPositions,
    activeDragNodeId,
    isDraggingNode,
    handleNodeMouseDown,
    resetPositions,
    wasRecentlyDragged,
  } = useNodeDrag({
    nodePositions,
    svgRef,
    containerGroupRef: panZoomGroupRef,
    disabled: disableNodeDrag,
    onPositionChange: onNodePositionChange,
  })

  // Imperative handle for parent components (e.g. centering nodes from sidebar)
  useImperativeHandle(
    ref,
    () => ({
      panToNode: (nodeId: string) => {
        const pos = effectiveNodePositions.get(nodeId)
        if (pos) {
          panToPoint(pos.x, pos.y)
        }
      },
      panToPoint,
      resetZoom,
      zoomIn,
      zoomOut,
    }),
    [effectiveNodePositions, panToPoint, resetZoom, zoomIn, zoomOut]
  )

  // Reactive prop centering
  useEffect(() => {
    if (centerNodeId) {
      const pos = effectiveNodePositions.get(centerNodeId)
      if (pos) {
        panToPoint(pos.x, pos.y)
      }
    }
  }, [centerNodeId, effectiveNodePositions, panToPoint])

  // Single-click: Select node -> affects Inspector (Stylebook §3.5: "không đụng beacon")
  const handleSelectNode = (node: DeviceSummary) => {
    if (wasRecentlyDragged()) return
    if (onSelectNode) {
      onSelectNode(node)
    } else {
      setInternalSelectedNodeId((prev) => (prev === node.id ? null : node.id))
      setInternalSelectedLinkId(null)
    }
  }

  // Single-click: Select link -> affects Inspector (Stylebook §5.4: Edge Inspector)
  const handleSelectLink = (link: LinkSummary) => {
    if (onSelectLink) {
      onSelectLink(link)
    } else {
      setInternalSelectedLinkId((prev) => (prev === link.linkId ? null : link.linkId))
      setInternalSelectedNodeId(null)
    }
  }

  // Double-click: Focus / Unfocus beacon toggle (Stylebook §3.5: "Bấm đúp một node → beacon... Bấm đúp lại → biến mất")
  const handleFocusNode = (node: DeviceSummary) => {
    if (wasRecentlyDragged()) return
    const isCurrentlyFocused = activeFocusedNodeIds.has(node.id)

    if (!isCurrentlyFocused) {
      const pos = effectiveNodePositions.get(node.id)
      if (pos) {
        panToPoint(pos.x, pos.y)
      }
    }

    if (onFocusNode) {
      onFocusNode(node)
    } else {
      setInternalFocusedNodeIds((prev) => {
        const next = new Set(prev)
        if (next.has(node.id)) {
          next.delete(node.id)
        } else {
          next.add(node.id)
        }
        return next
      })
    }
  }

  // Step 5.5b: Semantic Zoom & Level of Detail (LOD) (Stylebook §3.2)
  const currentZoom = zoom ?? transform.k
  const isLodFar = lod === 'far' ? true : lod === 'near' ? false : currentZoom < lodThreshold

  return (
    <div
      ref={containerRef}
      onMouseDown={(e) => {
        setTooltipTarget(null)
        handleMouseDown(e)
      }}
      onDoubleClick={handleDoubleClick}
      className={cn(
        'relative w-full h-full min-w-0 min-h-0 overflow-hidden select-none',
        isDraggingNode
          ? 'cursor-grabbing'
          : disablePanZoom
          ? ''
          : isPanning
          ? 'cursor-grabbing'
          : 'cursor-grab',
        'bg-[#f8fafc] dark:bg-[#0b0f19] text-[#0f172a] dark:text-[#f8fafc]',
        className
      )}
      style={style}
      data-testid="topology-canvas"
      data-lod={isLodFar ? 'far' : 'near'}
    >
      {/* SVG Canvas Root */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-full block"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Stratified Network Topology Canvas"
      >
        {/* Transparent backdrop for receiving drag pan events anywhere on empty canvas */}
        <rect
          width={dimensions.width}
          height={dimensions.height}
          fill="transparent"
          className="pointer-events-auto"
        />

        {/* Pan & Zoom Transformed Container (Step 5.1 & Step 5.5) */}
        <g
          ref={panZoomGroupRef}
          className="topology-pan-zoom-container"
          data-testid="topology-pan-zoom-container"
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
          style={{
            transition: isTransitioning ? 'transform 240ms cubic-bezier(0, 0, 0.2, 1)' : 'none',
          }}
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
            const sourcePos = effectiveNodePositions.get(link.sourceDeviceId)
            const targetPos = effectiveNodePositions.get(link.targetDeviceId)

            if (!sourcePos || !targetPos) return null

            // Prune Mode filtering (Step 5.3)
            if (
              activeFilterMode === 'prune' &&
              activeKHop !== 'all' &&
              egoNetwork.dimmedLinkIds.has(link.linkId)
            ) {
              return null
            }

            const isSelected = activeSelectedLinkId === link.linkId
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
                isLodFar={isLodFar}
                showPortAnchors={showPortAnchors}
                onClick={handleSelectLink}
                onMouseEnter={(l, e) => {
                  setInternalHoveredLinkId(l.linkId)
                  onLinkHover?.(l, e)
                  if (showTooltip) {
                    const rect = containerRef.current?.getBoundingClientRect()
                    const x = rect ? e.clientX - rect.left : e.clientX
                    const y = rect ? e.clientY - rect.top : e.clientY
                    setTooltipTarget({ type: 'link', link: l, cursor: { x, y } })
                  }
                }}
                onMouseMove={(l, e) => {
                  if (showTooltip) {
                    const rect = containerRef.current?.getBoundingClientRect()
                    const x = rect ? e.clientX - rect.left : e.clientX
                    const y = rect ? e.clientY - rect.top : e.clientY
                    setTooltipTarget({ type: 'link', link: l, cursor: { x, y } })
                  }
                }}
                onMouseLeave={(_l, e) => {
                  setInternalHoveredLinkId(null)
                  onLinkHover?.(null, e)
                  setTooltipTarget(null)
                }}
              />
            )
          })}
        </g>

        {/* Layer 3: Concentric Beacon Rings for Focused Nodes (Stylebook §3.5: Layer riêng) */}
        <g className="topology-beacons-layer" data-testid="topology-beacons-layer">
          {Array.from(effectiveNodePositions.values())
            .filter((pos) => {
              if (!activeFocusedNodeIds.has(pos.id)) return false
              if (
                activeFilterMode === 'prune' &&
                activeKHop !== 'all' &&
                egoNetwork.dimmedNodeIds.has(pos.id)
              ) {
                return false
              }
              return true
            })
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
          {Array.from(effectiveNodePositions.values()).map((pos) => {
            // Prune Mode filtering (Step 5.3)
            if (
              activeFilterMode === 'prune' &&
              activeKHop !== 'all' &&
              egoNetwork.dimmedNodeIds.has(pos.id)
            ) {
              return null
            }

            const isSelected = activeSelectedNodeId === pos.id
            const isFocused = activeFocusedNodeIds.has(pos.id)
            const isExpanded = expandedNodeIds?.includes(pos.id)
            const isDimmed = effectiveDimmedNodeIds.has(pos.id)
            const isHovered = activeHoveredNodeId === pos.id
            const isDragging = activeDragNodeId === pos.id

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
                isDragging={isDragging}
                isLodFar={isLodFar}
                locale={locale}
                onMouseDown={handleNodeMouseDown}
                onClick={handleSelectNode}
                onDoubleClick={handleFocusNode}
                onMouseEnter={(node, e) => {
                  if (isDraggingNode) return
                  setInternalHoveredNodeId(node.id)
                  onNodeHover?.(node, e)
                  if (showTooltip) {
                    const rect = containerRef.current?.getBoundingClientRect()
                    const x = rect ? e.clientX - rect.left : e.clientX
                    const y = rect ? e.clientY - rect.top : e.clientY
                    setTooltipTarget({ type: 'node', node, cursor: { x, y } })
                  }
                }}
                onMouseMove={(node, e) => {
                  if (isDraggingNode) return
                  if (showTooltip) {
                    const rect = containerRef.current?.getBoundingClientRect()
                    const x = rect ? e.clientX - rect.left : e.clientX
                    const y = rect ? e.clientY - rect.top : e.clientY
                    setTooltipTarget({ type: 'node', node, cursor: { x, y } })
                  }
                }}
                onMouseLeave={(_node, e) => {
                  setInternalHoveredNodeId(null)
                  onNodeHover?.(null, e)
                  setTooltipTarget(null)
                }}
                onToggleExpand={onToggleExpandNode}
              />
            )
          })}
        </g>

        {/* Layer 5: Custom SVG Overlays / Visual Annotations Slot */}
        {typeof children === 'function' ? children(layout) : children}
        </g>
      </svg>

      {/* HTML Floating Overlay 1: Top-Right Viewport Controls (Stylebook §0.1 & §3.2) */}
      {showControls && (
        <ViewportControls
          zoom={zoom ?? transform.k}
          onZoomIn={onZoomIn ?? zoomIn}
          onZoomOut={onZoomOut ?? zoomOut}
          onFit={onFit ?? resetZoom}
          disableZoomIn={!canZoomIn}
          disableZoomOut={!canZoomOut}
          hasCustomPositions={hasCustomPositions}
          onResetPositions={() => {
            resetPositions()
            onResetPositions?.()
          }}
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

      {/* HTML Floating Overlay 3: Top-Left k-Hop Ego-Network Filter Toolbar (Stylebook §3.5) */}
      {showKHopControls && activeFocusedNodeIds.size > 0 && (
        <KHopControls
          focusNodeIds={activeFocusedNodeIds}
          kHop={activeKHop}
          filterMode={activeFilterMode}
          onKHopChange={handleKHopChange}
          onFilterModeChange={handleFilterModeChange}
          onClearFocus={handleClearFocus}
          locale={locale}
        />
      )}

      {/* HTML Floating Overlay 4: Rich Contextual Tooltip (Stylebook §3.4) */}
      {showTooltip && (
        <TopologyTooltip
          target={tooltipTarget}
          containerRef={containerRef}
          locale={locale}
        />
      )}
    </div>
  )
})

TopologyCanvas.displayName = 'TopologyCanvas'
