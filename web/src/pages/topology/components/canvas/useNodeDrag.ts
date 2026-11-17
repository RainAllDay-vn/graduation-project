import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import type { DeviceSummary } from '@/api/topology'
import type { NodePosition } from './types'

export interface DragState {
  nodeId: string
  startX: number
  startY: number
  offset: { x: number; y: number }
  hasDragged: boolean
}

export interface UseNodeDragOptions {
  nodePositions: Map<string, NodePosition>
  svgRef: React.RefObject<SVGSVGElement | null>
  containerGroupRef: React.RefObject<SVGGElement | null>
  disabled?: boolean
  initialCustomPositions?: Record<string, { x: number; y: number }>
  onPositionChange?: (nodeId: string, pos: { x: number; y: number }) => void
}

/**
 * Custom hook for Interactive Node Dragging (Stylebook §3.3)
 *
 * Rules:
 * - Edge endpoints follow the node smoothly during drag in real-time.
 * - Nodes can be dragged freely without tier-locking.
 * - Positions persist during the active session.
 * - Suppresses click/double-click when drag distance exceeds 4px.
 */
export function useNodeDrag({
  nodePositions,
  svgRef,
  containerGroupRef,
  disabled = false,
  initialCustomPositions,
  onPositionChange,
}: UseNodeDragOptions) {
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>(
    () => initialCustomPositions ?? {}
  )
  const [activeDragNodeId, setActiveDragNodeId] = useState<string | null>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const wasDraggedRef = useRef<boolean>(false)

  // Combined positions map: overrides layout coordinates with custom dragged coordinates
  const effectiveNodePositions = useMemo(() => {
    const map = new Map<string, NodePosition>()
    nodePositions.forEach((pos, id) => {
      const custom = customPositions[id]
      if (custom) {
        map.set(id, { ...pos, x: custom.x, y: custom.y })
      } else {
        map.set(id, pos)
      }
    })
    return map
  }, [nodePositions, customPositions])

  // Start drag on mousedown
  const handleNodeMouseDown = useCallback(
    (node: DeviceSummary, e: React.MouseEvent<SVGGElement>) => {
      if (disabled || e.button !== 0) return // Only primary mouse button
      e.stopPropagation()

      const svg = svgRef.current
      const g = containerGroupRef.current
      if (!svg || !g) return

      const currentPos = effectiveNodePositions.get(node.id)
      if (!currentPos) return

      const ctm = g.getScreenCTM()
      if (!ctm) return

      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const localPt = pt.matrixTransform(ctm.inverse())

      dragStateRef.current = {
        nodeId: node.id,
        startX: e.clientX,
        startY: e.clientY,
        offset: {
          x: localPt.x - currentPos.x,
          y: localPt.y - currentPos.y,
        },
        hasDragged: false,
      }
      wasDraggedRef.current = false
    },
    [disabled, effectiveNodePositions, svgRef, containerGroupRef]
  )

  // Attach global mousemove & mouseup listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const state = dragStateRef.current
      if (!state) return

      const dx = e.clientX - state.startX
      const dy = e.clientY - state.startY
      const dist = Math.hypot(dx, dy)

      if (!state.hasDragged) {
        if (dist > 4) {
          state.hasDragged = true
          wasDraggedRef.current = true
          setActiveDragNodeId(state.nodeId)
        } else {
          return
        }
      }

      const svg = svgRef.current
      const g = containerGroupRef.current
      if (!svg || !g) return

      const ctm = g.getScreenCTM()
      if (!ctm) return

      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const localPt = pt.matrixTransform(ctm.inverse())

      const newX = Math.round(localPt.x - state.offset.x)
      const newY = Math.round(localPt.y - state.offset.y)

      setCustomPositions((prev) => {
        const next = { ...prev, [state.nodeId]: { x: newX, y: newY } }
        onPositionChange?.(state.nodeId, { x: newX, y: newY })
        return next
      })
    }

    const handleMouseUp = () => {
      const state = dragStateRef.current
      if (!state) return

      if (state.hasDragged) {
        // Keep wasDraggedRef true momentarily so click events right after mouseup are ignored
        setTimeout(() => {
          wasDraggedRef.current = false
        }, 100)
      }

      dragStateRef.current = null
      setActiveDragNodeId(null)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [svgRef, containerGroupRef, onPositionChange])

  const resetPositions = useCallback(() => {
    setCustomPositions({})
  }, [])

  return {
    effectiveNodePositions,
    customPositions,
    hasCustomPositions: Object.keys(customPositions).length > 0,
    activeDragNodeId,
    isDraggingNode: activeDragNodeId !== null,
    handleNodeMouseDown,
    resetPositions,
    wasRecentlyDragged: useCallback(() => wasDraggedRef.current, []),
  }
}
