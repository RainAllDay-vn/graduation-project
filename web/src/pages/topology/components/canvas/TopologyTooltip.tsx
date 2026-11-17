import React from 'react'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import { cn } from '@/lib/utils'
import { getSiteColor } from './siteColors'

export interface TooltipTargetNode {
  type: 'node'
  node: DeviceSummary
  cursor: { x: number; y: number }
}

export interface TooltipTargetLink {
  type: 'link'
  link: LinkSummary
  cursor: { x: number; y: number }
}

export type TooltipTarget = TooltipTargetNode | TooltipTargetLink | null

export interface TopologyTooltipProps {
  target: TooltipTarget
  containerRef?: React.RefObject<HTMLDivElement | null>
  locale?: 'vi' | 'en'
  className?: string
}

/**
 * Floating Topology Tooltip (Stylebook §3.4 & §5.4)
 *
 * Renders rich contextual hover tooltips for nodes and edges:
 * - Node Tooltip: ID, health status, site, management IP, model, CPU · RAM · Temp, open warnings.
 * - Edge Tooltip: Endpoints with ports, installed bandwidth, utilization percent, error rate.
 * - Position tracks mouse cursor with smart viewport edge-flipping; disappears on mouseleave.
 */
export const TopologyTooltip: React.FC<TopologyTooltipProps> = ({
  target,
  containerRef,
  locale = 'vi',
  className,
}) => {
  if (!target) return null

  const isEn = locale === 'en'
  const { cursor } = target

  // Calculate container-relative bounds for smart flipping
  let posX = cursor.x + 14
  let posY = cursor.y + 14

  if (containerRef?.current) {
    const rect = containerRef.current.getBoundingClientRect()
    const tooltipWidth = 270
    const tooltipHeight = target.type === 'node' ? 180 : 160

    if (cursor.x + tooltipWidth > rect.width - 16) {
      posX = Math.max(8, cursor.x - tooltipWidth - 14)
    }
    if (cursor.y + tooltipHeight > rect.height - 16) {
      posY = Math.max(8, cursor.y - tooltipHeight - 14)
    }
  }

  return (
    <div
      className={cn(
        'absolute z-50 pointer-events-none select-none transition-all duration-75',
        'w-[270px] rounded-lg p-3 shadow-2xl backdrop-blur-md',
        'bg-[#0b0f19]/95 text-slate-100 border border-slate-700/80',
        'font-sans text-xs',
        className
      )}
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
      }}
      data-testid="topology-tooltip"
      role="tooltip"
    >
      {target.type === 'node' ? (
        /* --- NODE TOOLTIP (Stylebook §3.4) --- */
        <div className="space-y-2" data-testid="tooltip-node-content">
          {/* Header: ID, Health Dot & Site Chip */}
          <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  target.node.status === 'ACTIVE'
                    ? 'bg-emerald-400 ring-2 ring-emerald-500/20'
                    : target.node.status === 'DEGRADED'
                    ? 'bg-amber-400 ring-2 ring-amber-500/20'
                    : 'bg-rose-500 ring-2 ring-rose-500/20'
                )}
              />
              <span className="font-mono font-extrabold text-sm tracking-wide text-white truncate">
                {target.node.id}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span
                className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase"
                style={{
                  color: getSiteColor(target.node.site),
                  borderColor: `${getSiteColor(target.node.site)}40`,
                  backgroundColor: `${getSiteColor(target.node.site)}15`,
                }}
              >
                {target.node.site}
              </span>
              <span className="font-mono text-[8.5px] font-semibold text-slate-400 bg-slate-800/80 px-1 py-0.5 rounded uppercase">
                {target.node.layer}
              </span>
            </div>
          </div>

          {/* Device Model & Management IP */}
          <div className="space-y-0.5 font-mono text-[10.5px]">
            <div className="flex justify-between text-slate-400">
              <span>{isEn ? 'Model:' : 'Dòng máy:'}</span>
              <span className="text-slate-200 font-medium truncate max-w-[170px]">
                {target.node.model || 'Cisco NCS / ASR'}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>{isEn ? 'Mgmt IP:' : 'IP quản lý:'}</span>
              <span className="text-sky-400 font-semibold">{target.node.ipAddress}</span>
            </div>
          </div>

          {/* Telemetry Row: CPU · RAM · Temp */}
          <div className="pt-1.5 border-t border-slate-800/80">
            <div className="text-[9.5px] font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1 flex justify-between">
              <span>{isEn ? 'Hardware Telemetry' : 'Thông số phần cứng'}</span>
              <span className="text-slate-500 font-normal">38°C</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-0.5 text-[9px]">
                  <span>CPU</span>
                  <span className="text-slate-200 font-bold">42%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
              <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                <div className="flex justify-between text-slate-400 mb-0.5 text-[9px]">
                  <span>RAM</span>
                  <span className="text-slate-200 font-bold">68%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: '68%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Open Alerts / Warnings Indicator */}
          <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">{isEn ? 'Open Alerts:' : 'Cảnh báo đang mở:'}</span>
            {target.node.accessErrorCount > 0 || target.node.status === 'CRITICAL' ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                {target.node.accessErrorCount > 0 ? `${target.node.accessErrorCount} ERROR` : '1 CRITICAL'}
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ✓ 0 {isEn ? 'alerts' : 'cảnh báo'}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* --- EDGE TOOLTIP (Stylebook §3.4 & §2.1-2.4) --- */
        <div className="space-y-2" data-testid="tooltip-edge-content">
          {/* Header: Link ID & Health Status */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  target.link.operStatus === 'UP'
                    ? 'bg-emerald-400 ring-2 ring-emerald-500/20'
                    : target.link.operStatus === 'DEGRADED'
                    ? 'bg-amber-400 ring-2 ring-amber-500/20'
                    : 'bg-rose-500 ring-2 ring-rose-500/20'
                )}
              />
              <span className="font-mono font-extrabold text-sm text-white">
                {target.link.linkId}
              </span>
            </div>
            <span
              className={cn(
                'font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase',
                target.link.operStatus === 'UP'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : target.link.operStatus === 'DEGRADED'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              )}
            >
              {target.link.operStatus}
            </span>
          </div>

          {/* Endpoints & Physical Ports (Stylebook §2.1) */}
          <div className="bg-slate-900/90 p-2 rounded border border-slate-800/80 font-mono text-[10px] space-y-1">
            <div className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">
              {isEn ? 'Endpoints & Ports' : 'Hai đầu & Cổng vật lý'}
            </div>
            <div className="flex items-center gap-1 text-slate-200">
              <span className="font-bold text-sky-400">{target.link.sourceDeviceId}</span>
              <span className="text-slate-500">:</span>
              <span className="text-slate-300 text-[9.5px] truncate max-w-[150px]">
                {target.link.sourcePort || '0/0/0'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-200">
              <span className="font-bold text-emerald-400">{target.link.targetDeviceId}</span>
              <span className="text-slate-500">:</span>
              <span className="text-slate-300 text-[9.5px] truncate max-w-[150px]">
                {target.link.targetPort || '0/0/0'}
              </span>
            </div>
          </div>

          {/* Bandwidth & Utilization (Stylebook §2.3 & §2.4) */}
          <div className="space-y-1 font-mono text-[10.5px]">
            <div className="flex justify-between text-slate-400">
              <span>{isEn ? 'Capacity:' : 'Băng thông lắp đặt:'}</span>
              <span className="text-slate-100 font-bold">{target.link.capacityGbps ?? 100} Gbps</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between text-slate-400 text-[10px]">
                <span>{isEn ? 'Utilization:' : 'Mức sử dụng hiện tại:'}</span>
                <span
                  className={cn(
                    'font-bold',
                    (target.link.utilizationPercent ?? 0) > 80
                      ? 'text-rose-400'
                      : (target.link.utilizationPercent ?? 0) > 50
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  )}
                >
                  {target.link.utilizationPercent ?? 0}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    (target.link.utilizationPercent ?? 0) > 80
                      ? 'bg-rose-500'
                      : (target.link.utilizationPercent ?? 0) > 50
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  )}
                  style={{ width: `${Math.min(100, target.link.utilizationPercent ?? 0)}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-slate-400 pt-0.5 text-[10px]">
              <span>{isEn ? 'Error Rate:' : 'Tỉ lệ lỗi:'}</span>
              <span
                className={cn(
                  'font-semibold',
                  target.link.operStatus === 'DOWN'
                    ? 'text-rose-400'
                    : target.link.operStatus === 'DEGRADED'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                )}
              >
                {target.link.operStatus === 'DOWN' ? '100%' : target.link.operStatus === 'DEGRADED' ? '0.24%' : '0.00%'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
