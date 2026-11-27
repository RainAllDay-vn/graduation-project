import React, { useState } from 'react'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import { cn } from '@/lib/utils'
import {
  NetworkOverviewPanel,
  NodeIdentityTab,
  NodeInspectorHeader,
  NodeTelemetryTab,
  type NodeInspectorTab,
  type TelemetryMockData,
} from './inspector'

export interface TopologyRightSidebarProps {
  /** All devices in the current topology view (used for network health overview) */
  nodes?: DeviceSummary[]
  /** All links in the current topology view (used for network health overview) */
  links?: LinkSummary[]
  /** Currently selected device (if any) */
  selectedNode?: DeviceSummary | null
  /** Currently selected link (if any) */
  selectedLink?: LinkSummary | null
  /** Optional active incident ID (unlocks Cảnh báo tab in Node Inspector) */
  incidentId?: string | null
  /** Optional initial node tab override (primarily for Storybook/tests) */
  initialNodeTab?: NodeInspectorTab
  /** Optional initial selected timeseries metric in Telemetry tab (Storybook/tests) */
  initialTelemetryMetric?: string | null
  /** Optional mock telemetry strictly for Storybook/tests */
  mockTelemetry?: TelemetryMockData
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
 * infrastructure KPIs, common node identity chrome + tab bar, and edge inspection.
 */
export const TopologyRightSidebar: React.FC<TopologyRightSidebarProps> = ({
  nodes,
  links,
  selectedNode,
  selectedLink,
  incidentId,
  initialNodeTab = 'identity',
  initialTelemetryMetric = null,
  mockTelemetry,
  onSelectNode,
  onSelectLink,
  onCloseInspect,
  locale = 'vi',
  className,
  style,
}) => {
  const isEn = locale === 'en'
  const [activeNodeTab, setActiveNodeTab] = useState<NodeInspectorTab>(initialNodeTab)

  const effectiveNodeTab: NodeInspectorTab =
    !incidentId && activeNodeTab === 'alerts' ? 'identity' : activeNodeTab

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
      <div className="flex items-baseline justify-between mb-3.5 pb-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div>
          <div className="font-mono text-[11px] font-extrabold tracking-wider text-slate-800 dark:text-[#94a3b8] uppercase">
            {isEn ? 'INSPECTOR' : 'INSPECTOR'}
          </div>
          <div className="font-mono text-[9px] font-bold tracking-widest text-slate-400 dark:text-[#64748b] uppercase mt-0.5">
            {isEn ? 'DETAILS · CHAPTER 5' : 'CHI TIẾT · CHƯƠNG 5'}
          </div>
        </div>

        {selectedLink && !selectedNode && (
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
        /* Inspecting a Selected Node (Stylebook §5.0: Common Header Strip + Tab Ribbon) */
        <div className="flex-1 flex flex-col gap-3 min-h-0" data-testid="node-inspector-panel">
          <NodeInspectorHeader
            node={selectedNode}
            activeTab={effectiveNodeTab}
            onTabChange={setActiveNodeTab}
            onBack={onCloseInspect}
            incidentId={incidentId}
            locale={locale}
          />

          {effectiveNodeTab === 'identity' ? (
            <NodeIdentityTab node={selectedNode} locale={locale} />
          ) : effectiveNodeTab === 'alerts' ? (
            <div
              className="flex-1 flex flex-col gap-2.5"
              role="tabpanel"
              data-testid="inspector-panel-alerts"
            >
              <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase">
                  {isEn ? 'DEVICE ALERTS · §5.2 INCIDENT' : 'CẢNH BÁO THIẾT BỊ · MỤC 5.2'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  {isEn
                    ? `Active and historical alarms scoped to ${selectedNode.id} (${incidentId}) will be rendered here.`
                    : `Danh sách cảnh báo của ${selectedNode.id} (thuộc sự cố ${incidentId}) sẽ hiển thị tại tab này.`}
                </p>
              </div>
            </div>
          ) : (
            <NodeTelemetryTab
              key={selectedNode.id}
              node={selectedNode}
              links={links}
              onSelectLink={onSelectLink}
              initialMetric={initialTelemetryMetric}
              mockTelemetry={mockTelemetry}
              locale={locale}
            />
          )}
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
