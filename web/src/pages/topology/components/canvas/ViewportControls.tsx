import React from 'react'
import { cn } from '@/lib/utils'

export interface ViewportControlsProps {
  /** Callback fired when Zoom In (+) is clicked */
  onZoomIn?: () => void
  /** Callback fired when Zoom Out (−) is clicked */
  onZoomOut?: () => void
  /** Callback fired when Fit (FIT) is clicked */
  onFit?: () => void
  /** Callback fired when Reset Positions is clicked (Stylebook §3.3) */
  onResetPositions?: () => void
  /** Whether any node positions have been customized/dragged */
  hasCustomPositions?: boolean
  /** Current zoom level as a fraction (e.g. 1.0 = 100%) */
  zoom?: number
  /** Whether zoom in is disabled (e.g. reached max zoom) */
  disableZoomIn?: boolean
  /** Whether zoom out is disabled (e.g. reached min zoom) */
  disableZoomOut?: boolean
  /** Additional CSS class names */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
}

/**
 * Viewport Controls Component (Stylebook §0.1 & §3.2)
 *
 * Floating top-right overlay with `+`, `−`, and `FIT` controls for
 * navigating the network topology canvas.
 */
export const ViewportControls: React.FC<ViewportControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFit,
  onResetPositions,
  hasCustomPositions = false,
  zoom,
  disableZoomIn = false,
  disableZoomOut = false,
  className,
  style,
}) => {
  const displayZoom = typeof zoom === 'number' ? Math.round(zoom * 100) : null

  return (
    <div
      className={cn(
        'absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5',
        'bg-[#1e293b]/90 dark:bg-[#1e293b]/90 bg-white/90',
        'backdrop-blur-sm border border-slate-200 dark:border-slate-700/60',
        'rounded-lg p-1 shadow-lg select-none transition-all duration-150',
        className
      )}
      style={style}
      role="toolbar"
      aria-label="Viewport zoom and navigation controls"
      data-testid="topology-viewport-controls"
    >
      {/* Zoom In Button */}
      <button
        type="button"
        onClick={onZoomIn}
        disabled={disableZoomIn}
        className={cn(
          'w-7 h-7 flex items-center justify-center rounded',
          'font-mono text-sm font-bold transition-colors outline-none',
          'focus-visible:ring-1 focus-visible:ring-sky-400',
          disableZoomIn
            ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
            : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60'
        )}
        title="Phóng to (+)"
        aria-label="Phóng to canvas"
        data-testid="viewport-zoom-in"
      >
        +
      </button>

      {/* Optional Zoom Percentage Indicator */}
      {displayZoom !== null && (
        <span
          className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-400 px-1 min-w-[34px] text-center"
          title={`Độ phóng đại hiện tại: ${displayZoom}%`}
        >
          {displayZoom}%
        </span>
      )}

      {/* Zoom Out Button */}
      <button
        type="button"
        onClick={onZoomOut}
        disabled={disableZoomOut}
        className={cn(
          'w-7 h-7 flex items-center justify-center rounded',
          'font-mono text-sm font-bold transition-colors outline-none',
          'focus-visible:ring-1 focus-visible:ring-sky-400',
          disableZoomOut
            ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
            : 'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60'
        )}
        title="Thu nhỏ (−)"
        aria-label="Thu nhỏ canvas"
        data-testid="viewport-zoom-out"
      >
        −
      </button>

      {/* Vertical separator */}
      <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700" />

      {/* Fit to Viewport Button */}
      <button
        type="button"
        onClick={onFit}
        className={cn(
          'px-2.5 h-7 flex items-center justify-center rounded',
          'font-mono text-[11px] font-extrabold tracking-wider transition-colors outline-none',
          'focus-visible:ring-1 focus-visible:ring-sky-400',
          'text-slate-600 dark:text-[#94a3b8] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60'
        )}
        title="Căn vừa toàn khung nhìn (FIT)"
        aria-label="Căn vừa toàn khung nhìn"
        data-testid="viewport-fit"
      >
        FIT
      </button>

      {/* Reset Custom Node Positions Button (Stylebook §3.3) */}
      {hasCustomPositions && onResetPositions && (
        <>
          <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700" />
          <button
            type="button"
            onClick={onResetPositions}
            className={cn(
              'px-2 h-7 flex items-center justify-center rounded',
              'font-mono text-[10px] font-extrabold tracking-wider transition-colors outline-none',
              'focus-visible:ring-1 focus-visible:ring-amber-400',
              'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            )}
            title="Đặt lại vị trí các node về chuẩn ban đầu (Stylebook §3.3)"
            aria-label="Đặt lại vị trí node"
            data-testid="viewport-reset-positions"
          >
            ĐẶT LẠI
          </button>
        </>
      )}
    </div>
  )
}
