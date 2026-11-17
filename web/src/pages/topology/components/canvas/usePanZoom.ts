import { useCallback, useEffect, useRef, useState } from 'react'

export interface PanZoomTransform {
  x: number
  y: number
  k: number
}

export interface UsePanZoomOptions {
  /** Minimum zoom scale factor (default: 0.4 = 40%) */
  minZoom?: number
  /** Maximum zoom scale factor (default: 2.5 = 250%) */
  maxZoom?: number
  /** Initial transform */
  initialTransform?: PanZoomTransform
  /** Callback fired whenever the viewport transform updates */
  onTransformChange?: (transform: PanZoomTransform) => void
  /** Canvas dimensions for center calculation */
  dimensions?: { width: number; height: number }
  /** Disable pan and zoom interactions */
  disabled?: boolean
}

export const DEFAULT_TRANSFORM: PanZoomTransform = { x: 0, y: 0, k: 1 }

export function usePanZoom({
  minZoom = 0.4,
  maxZoom = 2.5,
  initialTransform = DEFAULT_TRANSFORM,
  onTransformChange,
  dimensions = { width: 1200, height: 680 },
  disabled = false,
}: UsePanZoomOptions = {}) {
  const [transform, setTransform] = useState<PanZoomTransform>(initialTransform)
  const [isPanning, setIsPanning] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Track drag state
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null)
  const transformRef = useRef<PanZoomTransform>(transform)
  transformRef.current = transform

  // Synchronize when initialTransform changes externally (e.g. controlled Storybook or URL reset)
  useEffect(() => {
    if (initialTransform) {
      setTransform((prev) => {
        if (
          prev.x === initialTransform.x &&
          prev.y === initialTransform.y &&
          prev.k === initialTransform.k
        ) {
          return prev
        }
        return initialTransform
      })
    }
  }, [initialTransform?.x, initialTransform?.y, initialTransform?.k])

  // Helper: Convert client coordinates to SVG viewBox coordinates
  const clientToSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const inv = ctm.inverse()
    const svgPt = pt.matrixTransform(inv)
    return { x: svgPt.x, y: svgPt.y }
  }, [])

  // Update transform with bounds clamping
  const updateTransform = useCallback(
    (newTransform: PanZoomTransform, triggerTransition = false) => {
      const clampedK = Math.max(minZoom, Math.min(maxZoom, Number(newTransform.k.toFixed(3))))
      const next: PanZoomTransform = {
        x: Number(newTransform.x.toFixed(2)),
        y: Number(newTransform.y.toFixed(2)),
        k: clampedK,
      }
      setIsTransitioning(triggerTransition)
      setTransform(next)
      onTransformChange?.(next)
    },
    [minZoom, maxZoom, onTransformChange]
  )

  // Zoom centered at an arbitrary SVG point (svgX, svgY)
  const zoomAtPoint = useCallback(
    (nextK: number, svgX: number, svgY: number, smooth = false) => {
      const { x, y, k } = transformRef.current
      const clampedNextK = Math.max(minZoom, Math.min(maxZoom, nextK))
      if (Math.abs(clampedNextK - k) < 0.001) return

      // Formula: keep the point under cursor invariant
      const factor = clampedNextK / k
      const newX = svgX - (svgX - x) * factor
      const newY = svgY - (svgY - y) * factor

      updateTransform({ x: newX, y: newY, k: clampedNextK }, smooth)
    },
    [minZoom, maxZoom, updateTransform]
  )

  // Zoom In (+20%) centered on canvas midpoint
  const zoomIn = useCallback(() => {
    const { k } = transformRef.current
    const nextK = Math.min(maxZoom, k * 1.2)
    zoomAtPoint(nextK, dimensions.width / 2, dimensions.height / 2, true)
  }, [maxZoom, zoomAtPoint, dimensions])

  // Zoom Out (-20%) centered on canvas midpoint
  const zoomOut = useCallback(() => {
    const { k } = transformRef.current
    const nextK = Math.max(minZoom, k / 1.2)
    zoomAtPoint(nextK, dimensions.width / 2, dimensions.height / 2, true)
  }, [minZoom, zoomAtPoint, dimensions])

  // Reset viewport to default fitted scale (FIT button)
  const resetZoom = useCallback(() => {
    updateTransform(DEFAULT_TRANSFORM, true)
  }, [updateTransform])

  // Native non-passive Wheel Event handler for smooth zoom around cursor
  useEffect(() => {
    const container = containerRef.current
    if (!container || disabled) return

    const handleWheel = (e: WheelEvent) => {
      // Prevent browser from zooming or scrolling the page
      e.preventDefault()

      const svgPt = clientToSvgPoint(e.clientX, e.clientY)
      const currentK = transformRef.current.k

      // Standardize wheel delta across devices/touchpads
      const delta = -e.deltaY
      const zoomFactor = delta > 0 ? 1.1 : 0.9
      const nextK = currentK * zoomFactor

      zoomAtPoint(nextK, svgPt.x, svgPt.y, false)
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [disabled, clientToSvgPoint, zoomAtPoint])

  // Mouse Down handler on background to initiate panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return
      // Only initiate panning on primary left click
      if (e.button !== 0) return

      // If the target is an interactive element (e.g. node, button, port anchor), don't pan canvas
      const target = e.target as HTMLElement | SVGElement
      const isInteractive =
        target.closest('button') ||
        target.closest('[data-interactive="true"]') ||
        target.closest('.topology-node-group') ||
        target.closest('.topology-edge-group') ||
        target.closest('[data-testid="topology-viewport-controls"]') ||
        target.closest('[data-testid="topology-site-legend"]')

      if (isInteractive) return

      setIsTransitioning(false)
      setIsPanning(true)
      dragStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        startX: transformRef.current.x,
        startY: transformRef.current.y,
      }
    },
    [disabled]
  )

  // Global mousemove and mouseup listeners while dragging
  useEffect(() => {
    if (!isPanning) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return
      const svg = svgRef.current
      if (!svg) return

      const ctm = svg.getScreenCTM()
      if (!ctm) return

      // Calculate translation delta in SVG coordinate units
      const scaleX = ctm.a
      const scaleY = ctm.d

      const deltaX = (e.clientX - dragStartRef.current.clientX) / (scaleX || 1)
      const deltaY = (e.clientY - dragStartRef.current.clientY) / (scaleY || 1)

      const nextX = dragStartRef.current.startX + deltaX
      const nextY = dragStartRef.current.startY + deltaY

      updateTransform(
        {
          x: nextX,
          y: nextY,
          k: transformRef.current.k,
        },
        false
      )
    }

    const handleMouseUp = () => {
      setIsPanning(false)
      dragStartRef.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isPanning, updateTransform])

  // Double click on canvas background triggers Fit to Viewport
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return
      const target = e.target as HTMLElement | SVGElement
      const isInteractive = target.closest('button') || target.closest('.topology-node')
      if (!isInteractive) {
        resetZoom()
      }
    },
    [disabled, resetZoom]
  )

  return {
    transform,
    isPanning,
    isTransitioning,
    containerRef,
    svgRef,
    zoomIn,
    zoomOut,
    resetZoom,
    setTransform: updateTransform,
    handleMouseDown,
    handleDoubleClick,
    canZoomIn: transform.k < maxZoom,
    canZoomOut: transform.k > minZoom,
  }
}
