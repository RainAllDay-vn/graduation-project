import React from 'react'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import { cn } from '@/lib/utils'
import { NetworkOverviewPanel } from './inspector'

export interface TopologyRightSidebarProps {
  /** All devices in the current topology view (used for network health overview) */
  nodes?: DeviceSummary[]
  /** All links in the current topology view (used for network health overview) */
  links?: LinkSummary[]
  /** Currently selected device (if any) */
  selectedNode?: DeviceSummary | null
  /** Currently selected link (if any) */
  selectedLink?: LinkSummary | null
  /** Callback fired when user quick-jumps to a device from overview attention list */
  onSelectNode?: (node: DeviceSummary) => void
  /** Callback fired when user quick-jumps to a link from overview attention list */
  onSelectLink?: (link: LinkSummary) => void
  /** Callback fired when user closes device inspection */
  onCloseInspect?: () => void
  /** Language locale */
  locale?: 'vi' | 'en'
  /** Additional CSS class names */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
}

/**
 * Topology Right Sidebar / Inspector (Stylebook §0.1, Ch.5 & app-pages/topology.html)
 *
 * Scaffolds the right column of the 3-column workspace with default network
 * infrastructure KPIs, edge inspection, and device inspection slots.
 */
export const TopologyRightSidebar: React.FC<TopologyRightSidebarProps> = ({
  nodes,
  links,
  selectedNode,
  selectedLink,
  onSelectNode,
  onSelectLink,
  onCloseInspect,
  locale = 'vi',
  className,
  style,
}) => {
  const isEn = locale === 'en'

  return (
    <aside
      className={cn(
        'w-80 shrink-0 flex flex-col h-full select-none',
        'bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-800',
        'p-4 overflow-y-auto no-scrollbar transition-colors duration-150',
        className
      )}
      style={style}
      data-testid="topology-right-sidebar"
    >
      {/* 1. Header & Section Identifier */}
      <div className="flex items-baseline justify-between mb-3.5 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="font-mono text-[11px] font-extrabold tracking-wider text-slate-800 dark:text-[#94a3b8] uppercase">
            {isEn ? 'INSPECTOR' : 'INSPECTOR'}
          </div>
          <div className="font-mono text-[9px] font-bold tracking-widest text-slate-400 dark:text-[#64748b] uppercase mt-0.5">
            {isEn ? 'DETAILS · CHAPTER 5' : 'CHI TIẾT · CHƯƠNG 5'}
          </div>
        </div>

        {(selectedNode || selectedLink) && (
          <button
            type="button"
            onClick={onCloseInspect}
            className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
          >
            ← {isEn ? 'CLOSE' : 'ĐÓNG'}
          </button>
        )}
      </div>

      {/* 2. Content Area */}
      {selectedNode ? (
        /* Inspecting a Selected Node */
        <div className="flex-1 flex flex-col gap-3">
          {/* Node Identity Card */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  selectedNode.status === 'ACTIVE'
                    ? 'bg-emerald-500'
                    : selectedNode.status === 'DEGRADED'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                )}
              />
              <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                {selectedNode.id}
              </span>
              <span className="ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {selectedNode.site}
              </span>
            </div>
            <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              {selectedNode.model} · {selectedNode.ipAddress}
            </div>
          </div>

          {/* Wireframe Placeholder for Telemetry & Charts */}
          <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase mt-1">
            {isEn ? 'HARDWARE TELEMETRY · PLACEHOLDER' : 'THÔNG SỐ PHẦN CỨNG · PLACEHOLDER'}
          </div>

          <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>CPU Core Load</span>
              <span className="font-bold">42%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-sky-500 w-[42%]" />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
              <span>RAM Allocation</span>
              <span className="font-bold">68%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-indigo-500 w-[68%]" />
            </div>
          </div>

          {/* Wireframe Placeholder for Physical Ports */}
          <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase mt-1">
            {isEn ? 'PORT CONFIGURATION · PLACEHOLDER' : 'CẤU HÌNH CỔNG VẬT LÝ · PLACEHOLDER'}
          </div>

          <div className="space-y-1.5">
            <div className="h-6 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 px-2 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>HundredGig0/0/0/1</span>
              <span className="text-emerald-500 font-bold">UP (100G)</span>
            </div>
            <div className="h-6 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 px-2 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span>HundredGig0/0/0/2</span>
              <span className="text-emerald-500 font-bold">UP (100G)</span>
            </div>
          </div>

          {/* Placeholder Notice */}
          <div className="mt-auto p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            💡 <strong>{isEn ? 'Chapter 5 Spec:' : 'Đặc tả Chương 5:'}</strong>{' '}
            {isEn
              ? 'Real-time telemetry, SFP optical diagnostics, and CLI diagnostic executor will be wired here.'
              : 'Dữ liệu telemetry đo quang SFP, thông số BGP/OSPF và lệnh CLI sẽ được gắn tại đây.'}
          </div>
        </div>
      ) : selectedLink ? (
        /* Inspecting a Selected Link (Stylebook §5.4: Edge Inspector) */
        <div className="flex-1 flex flex-col gap-3" data-testid="edge-inspector-panel">
          {/* Link Identity Card */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    selectedLink.operStatus === 'UP'
                      ? 'bg-emerald-500'
                      : selectedLink.operStatus === 'DEGRADED'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  )}
                />
                <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                  {selectedLink.linkId}
                </span>
              </div>
              <span
                className={cn(
                  'font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase',
                  selectedLink.operStatus === 'UP'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : selectedLink.operStatus === 'DEGRADED'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                )}
              >
                {selectedLink.operStatus}
              </span>
            </div>

            {/* Endpoints & Physical Ports (Stylebook §5.4) */}
            <div className="mt-2 p-2 rounded bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 font-mono text-[10px] space-y-1">
              <div className="text-slate-400 text-[8.5px] uppercase tracking-wider font-semibold">
                {isEn ? 'CONNECTED ENDPOINTS & PORTS' : 'HAI ĐẦU & CỔNG VẬT LÝ'}
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="font-bold text-sky-600 dark:text-sky-400">{selectedLink.sourceDeviceId}</span>
                <span className="text-[9px] text-slate-400">{selectedLink.sourcePort || '0/0/0'}</span>
              </div>
              <div className="text-center text-[9px] text-slate-400">↓</div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedLink.targetDeviceId}</span>
                <span className="text-[9px] text-slate-400">{selectedLink.targetPort || '0/0/0'}</span>
              </div>
            </div>
          </div>

          {/* Link Performance & Bandwidth (Stylebook §2.3 & §2.4) */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 font-mono text-xs space-y-2.5">
            <div className="text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase">
              {isEn ? 'LINK TELEMETRY & SPECS' : 'THÔNG SỐ BĂNG THÔNG & QUANG'}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-[10.5px]">
                {isEn ? 'Installed Capacity:' : 'Băng thông lắp đặt:'}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedLink.capacityGbps ?? 100} Gbps
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-slate-500 dark:text-slate-400">
                  {isEn ? 'Current Utilization:' : 'Hiệu suất sử dụng:'}
                </span>
                <span
                  className={cn(
                    'font-bold',
                    (selectedLink.utilizationPercent ?? 0) > 80
                      ? 'text-rose-500'
                      : (selectedLink.utilizationPercent ?? 0) > 50
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  )}
                >
                  {selectedLink.utilizationPercent ?? 0}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    (selectedLink.utilizationPercent ?? 0) > 80
                      ? 'bg-rose-500'
                      : (selectedLink.utilizationPercent ?? 0) > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  )}
                  style={{ width: `${Math.min(100, selectedLink.utilizationPercent ?? 0)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10.5px] pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
              <span className="text-slate-500 dark:text-slate-400">
                {isEn ? 'Packet Error Rate:' : 'Tỉ lệ lỗi gói:'}
              </span>
              <span
                className={cn(
                  'font-semibold',
                  selectedLink.operStatus === 'DOWN'
                    ? 'text-rose-500'
                    : selectedLink.operStatus === 'DEGRADED'
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                )}
              >
                {selectedLink.operStatus === 'DOWN' ? '100%' : selectedLink.operStatus === 'DEGRADED' ? '0.24%' : '0.00%'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>{isEn ? 'Media Type:' : 'Loại môi truyền:'}</span>
              <span className="text-slate-600 dark:text-slate-300">
                {selectedLink.linkType || 'PHYSICAL_FIBER'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Default: Network Health Overview (When no node or link is selected) */
        <NetworkOverviewPanel
          nodes={nodes}
          links={links}
          onSelectNode={onSelectNode}
          onSelectLink={onSelectLink}
          locale={locale}
        />
      )}
    </aside>
  )
}
