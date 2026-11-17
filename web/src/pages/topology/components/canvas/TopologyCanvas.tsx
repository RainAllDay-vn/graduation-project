import React, { useMemo, useState } from 'react'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import { cn } from '@/lib/utils'
import { computeStratifiedLayout } from './layoutEngine'
import { TierBands } from './TierBands'
import { TopologyEdge } from './TopologyEdge'
import { TopologyNode } from './TopologyNode'
import type { StratifiedLayoutResult } from './types'

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
  selectedNodeId,
  focusedNodeIds,
  focusNodeId,
  expandedNodeIds,
  dimmedNodeIds,
  hoveredNodeId: externalHoveredNodeId,
  selectedLinkId,
  dimmedLinkIds,
  blastRadiusLinkIds,
  hoveredLinkId: externalHoveredLinkId,
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

  const activeHoveredNodeId = externalHoveredNodeId ?? internalHoveredNodeId
  const activeHoveredLinkId = externalHoveredLinkId ?? internalHoveredLinkId

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

  return (
    <div
      className={cn(
        'relative w-full h-full min-h-[500px] overflow-hidden select-none',
        'bg-[#f8fafc] dark:bg-[#0b0f19] text-[#0f172a] dark:text-[#f8fafc]',
        className
      )}
      style={style}
      data-testid="topology-canvas"
    >
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
            const isDimmed = dimmedLinkIds?.includes(link.linkId)
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

        {/* Layer 3: Network Node Cards (Positioned atop edges) */}
        <g className="topology-nodes-layer" data-testid="topology-nodes-layer">
          {Array.from(nodePositions.values()).map((pos) => {
            const isSelected = selectedNodeId === pos.id
            const isFocused =
              focusedNodeIds?.includes(pos.id) || focusNodeId === pos.id
            const isExpanded = expandedNodeIds?.includes(pos.id)
            const isDimmed = dimmedNodeIds?.includes(pos.id)
            const isHovered = activeHoveredNodeId === pos.id

            return (
              <TopologyNode
                key={pos.id}
                node={pos.node}
                x={pos.x}
                y={pos.y}
                isSelected={isSelected}
                isFocused={isFocused}
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

        {/* Layer 4: Slot for Higher Floating Overlays / Custom Visuals */}
        {typeof children === 'function' ? children(layout) : children}
      </svg>
    </div>
  )
}
