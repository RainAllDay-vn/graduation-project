import React from 'react'
import type { DeviceSummary } from '@/api/topology'
import { cn } from '@/lib/utils'
import { getSiteColor } from '../canvas/siteColors'

export interface DeviceRowProps {
  device: DeviceSummary
  isSelected?: boolean
  onClick: (device: DeviceSummary) => void
  locale?: 'vi' | 'en'
}

/**
 * Maps device layer to compact display label
 */
function getLayerTag(layer: string, isEn: boolean): string {
  switch (layer) {
    case 'PEER':
    case 'IGW':
      return isEn ? 'BORDER' : 'BIÊN'
    case 'CORE':
      return 'CORE'
    case 'AGGREGATION':
      return 'AGG'
    case 'EXCHANGE':
    case 'ACCESS':
      return 'EXCH'
    default:
      return layer
  }
}

export const DeviceRow: React.FC<DeviceRowProps> = ({
  device,
  isSelected = false,
  onClick,
  locale = 'vi',
}) => {
  const isEn = locale === 'en'
  const siteColor = getSiteColor(device.site)
  const isCritical = device.status === 'CRITICAL' || device.status === 'OFFLINE'
  const isWarning = device.status === 'DEGRADED'
  const layerTag = getLayerTag(device.layer, isEn)

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={`device-row-${device.id}`}
      data-selected={isSelected}
      onClick={() => onClick(device)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(device)
        }
      }}
      className={cn(
        'group relative flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-150 outline-none',
        'border-l-[3px] select-none',
        isSelected
          ? 'bg-sky-500/10 dark:bg-sky-500/15 border-l-sky-500 shadow-xs'
          : 'border-l-transparent hover:bg-slate-100/90 dark:hover:bg-slate-800/60'
      )}
    >
      {/* Left: Health Dot + ID + Layer + IP/Site */}
      <div className="flex items-center gap-2.5 min-w-0 pr-1">
        {/* Status indicator dot */}
        <span
          className={cn(
            'w-2 h-2 rounded-full shrink-0 transition-all duration-200',
            isCritical
              ? 'bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]'
              : isWarning
                ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
          )}
          title={`Status: ${device.status}`}
        />

        <div className="min-w-0 flex flex-col">
          {/* Top: Device ID + Layer Tag */}
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'font-mono text-[11.5px] font-bold tracking-tight truncate transition-colors duration-150',
                isSelected
                  ? 'text-sky-700 dark:text-sky-300 font-extrabold'
                  : 'text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400'
              )}
            >
              {device.id}
            </span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded text-[8.5px] font-mono font-semibold tracking-wider shrink-0 uppercase',
                'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300/40 dark:border-slate-700/50'
              )}
            >
              {layerTag}
            </span>
          </div>

          {/* Bottom: IP Address + Site Indicator */}
          <div className="flex items-center gap-2 mt-0.5 text-[9.5px] font-mono text-slate-500 dark:text-slate-400">
            <span className="truncate">{device.ipAddress || '—'}</span>
            <span className="flex items-center gap-1 shrink-0">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: siteColor }}
              />
              <span className="text-[9px] uppercase font-semibold">{device.site}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Leaf Count / Error Count Badge */}
      {device.accessDeviceCount > 0 && (
        <div className="shrink-0 pl-1">
          {device.accessErrorCount > 0 ? (
            <span
              className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold tracking-wider bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
              title={`${device.accessDeviceCount} access devices, ${device.accessErrorCount} with errors`}
            >
              +{device.accessDeviceCount} | {device.accessErrorCount}!
            </span>
          ) : (
            <span
              className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-medium tracking-wider bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/40"
              title={`${device.accessDeviceCount} access devices`}
            >
              +{device.accessDeviceCount}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
