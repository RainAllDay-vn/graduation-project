import React from 'react'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import { cn } from '@/lib/utils'

export interface TopologyRightSidebarProps {
  /** Currently selected device (if any) */
  selectedNode?: DeviceSummary | null
  /** Currently selected link (if any) */
  selectedLink?: LinkSummary | null
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
 * Scaffolds the right column of the 3-column workspace with inspection
 * details and clean placeholder text/wireframe cards.
 */
export const TopologyRightSidebar: React.FC<TopologyRightSidebarProps> = ({
  selectedNode,
  selectedLink,
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
        /* Inspecting a Selected Link */
        <div className="flex-1 flex flex-col gap-3">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <div className="font-mono font-extrabold text-sm text-slate-900 dark:text-white mb-1">
              {selectedLink.linkId}
            </div>
            <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              {selectedLink.sourceDeviceId} → {selectedLink.targetDeviceId}
            </div>
          </div>

          <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
            <div className="h-2.5 rounded bg-slate-200 dark:bg-slate-800 w-full animate-pulse" />
            <div className="h-2 rounded bg-slate-200/70 dark:bg-slate-800/70 w-3/4" />
          </div>
        </div>
      ) : (
        /* Default: Network Overview Cards (When no item is selected) */
        <div className="flex-1 flex flex-col gap-2.5">
          <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase">
            {isEn ? 'NETWORK HEALTH OVERVIEW' : 'TỔNG QUAN HẠ TẦNG MẠNG'}
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isEn ? 'Total Devices' : 'Tổng thiết bị'}
              </div>
              <div className="font-mono font-extrabold text-lg text-slate-900 dark:text-white mt-0.5">
                78
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isEn ? 'Normal State' : 'Bình thường'}
              </div>
              <div className="font-mono font-extrabold text-lg text-emerald-500 mt-0.5">
                72
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isEn ? 'Degraded/Crit' : 'Cảnh báo'}
              </div>
              <div className="font-mono font-extrabold text-lg text-rose-500 mt-0.5">
                6
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isEn ? 'Trunk Links' : 'Đường trục'}
              </div>
              <div className="font-mono font-extrabold text-lg text-slate-900 dark:text-white mt-0.5">
                152
              </div>
            </div>
          </div>

          {/* Wireframe skeleton blocks */}
          <div className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 mt-1">
            <div className="h-2.5 rounded bg-slate-200 dark:bg-slate-800 w-full animate-pulse" />
            <div className="h-2 rounded bg-slate-200/70 dark:bg-slate-800/70 w-4/5" />
            <div className="h-2 rounded bg-slate-200/70 dark:bg-slate-800/70 w-2/3" />
          </div>

          {/* Hint callout */}
          <div className="mt-auto p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            💡 <strong>{isEn ? 'Usage Hint:' : 'Hướng dẫn:'}</strong>{' '}
            {isEn
              ? 'Click any router or link on the canvas to inspect its hardware telemetry and port details.'
              : 'Bấm vào bất kỳ router hoặc liên kết nào trên bản đồ để xem chi tiết thông số viễn thông và cấu hình cổng trực tiếp.'}
          </div>
        </div>
      )}
    </aside>
  )
}
