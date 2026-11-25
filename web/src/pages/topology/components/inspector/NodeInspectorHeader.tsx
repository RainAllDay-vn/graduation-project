import React from 'react'
import { ArrowLeft } from 'lucide-react'
import type { DeviceLayer, DeviceSummary } from '@/api/topology'
import { cn } from '@/lib/utils'

export type NodeInspectorTab = 'identity' | 'telemetry' | 'alerts'

export interface NodeInspectorHeaderProps {
  node: DeviceSummary
  activeTab: NodeInspectorTab
  onTabChange: (tab: NodeInspectorTab) => void
  onBack?: () => void
  incidentId?: string | null
  locale?: 'vi' | 'en'
  className?: string
}

const LAYER_LABELS: Record<DeviceLayer, { vi: string; en: string }> = {
  PEER: { vi: 'BIÊN · PEERING & TRANSIT', en: 'BORDER · PEERING & TRANSIT' },
  IGW: { vi: 'BIÊN · CỔNG QUỐC GIA', en: 'BORDER · NATIONAL GATEWAY' },
  CORE: { vi: 'LÕI · XƯƠNG SỐNG CORE', en: 'CORE · BACKBONE ROUTER' },
  AGGREGATION: { vi: 'TỔNG HỢP BIÊN (AGG)', en: 'EDGE AGGREGATION (AGG)' },
  EXCHANGE: { vi: 'TRUNG TÂM TỔNG ĐÀI (EXCH)', en: 'METRO EXCHANGE (EXCH)' },
  ACCESS: { vi: 'TRUY CẬP ĐẦU CUỐI (ACC)', en: 'ACCESS SWITCH (ACC)' },
}

/**
 * Common Node Identity Header Strip & Tab Ribbon (Stylebook §5.0 Nguyên tắc chung)
 *
 * Always visible at the top of Inspector when a device is selected:
 * - Back button (clears selection, returns to Network Overview)
 * - Health status dot, Device ID, Layer descriptor
 * - Underline tab ribbon keeping device context intact across tab switches
 */
export const NodeInspectorHeader: React.FC<NodeInspectorHeaderProps> = ({
  node,
  activeTab,
  onTabChange,
  onBack,
  incidentId,
  locale = 'vi',
  className,
}) => {
  const isEn = locale === 'en'

  const statusDotClass =
    node.status === 'ACTIVE'
      ? 'bg-emerald-500'
      : node.status === 'DEGRADED'
      ? 'bg-amber-500'
      : 'bg-rose-500'

  const layerText = LAYER_LABELS[node.layer]?.[isEn ? 'en' : 'vi'] ?? node.layer

  const tabs: Array<{ id: NodeInspectorTab; label: string }> = incidentId
    ? [
        { id: 'identity', label: isEn ? 'Identity' : 'Định danh' },
        { id: 'alerts', label: isEn ? 'Alerts' : 'Cảnh báo' },
        { id: 'telemetry', label: isEn ? 'Status' : 'Trạng thái' },
      ]
    : [
        { id: 'identity', label: isEn ? 'Identity' : 'Định danh' },
        { id: 'telemetry', label: isEn ? 'Status' : 'Trạng thái' },
      ]

  return (
    <div className={cn('shrink-0', className)} data-testid="node-inspector-chrome">
      {/* 1. Common Identity Strip (.i-head) */}
      <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b111e] border border-slate-200 dark:border-slate-700/70">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            data-testid="inspector-back-btn"
            className="shrink-0 inline-flex items-center gap-1 px-2 py-1.5 rounded-md font-mono text-[10px] font-extrabold tracking-wide bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer"
            title={isEn ? 'Back to network overview' : 'Quay lại tổng quan mạng'}
          >
            <ArrowLeft className="w-3 h-3" />
            {isEn ? 'BACK' : 'ĐÓNG'}
          </button>
        )}

        <span
          className={cn('w-2.5 h-2.5 rounded-full shrink-0', statusDotClass)}
          data-testid="inspector-node-status-dot"
          title={node.status}
        />

        <div className="min-w-0 flex-1">
          <div
            className="font-mono font-extrabold text-[13.5px] tracking-wide text-slate-900 dark:text-white truncate"
            data-testid="inspector-node-id"
          >
            {node.id}
          </div>
          <div
            className="font-mono font-bold text-[9px] tracking-[0.08em] text-slate-500 dark:text-slate-400 uppercase truncate mt-0.5"
            data-testid="inspector-node-layer"
          >
            {layerText}
          </div>
        </div>
      </div>

      {/* 2. Underline Tab Ribbon (.i-ribbon) */}
      <div
        className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 mt-3"
        role="tablist"
        data-testid="inspector-tab-bar"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={`inspector-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'py-1.5 px-0.5 text-[11px] font-bold tracking-wide border-b-2 -mb-px transition-colors outline-none cursor-pointer',
                isActive
                  ? 'text-slate-900 dark:text-slate-100 border-sky-500 dark:border-[#38bdf8]'
                  : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
