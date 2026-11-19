import React, { useState } from 'react'
import type { DeviceSummary } from '@/api/topology'
import { cn } from '@/lib/utils'
import { DeviceDirectoryTab } from './sidebar'

export interface TopologyLeftSidebarProps {
  /** Optional ID of active incident (unlocks Timeline & Hypothesis tabs) */
  incidentId?: string | null
  /** List of devices from the topology graph */
  nodes?: DeviceSummary[]
  /** Currently selected node ID */
  selectedNodeId?: string | null
  /** Callback fired when user selects a device from the directory */
  onSelectDevice?: (device: DeviceSummary) => void
  /** Language locale */
  locale?: 'vi' | 'en'
  /** Additional CSS class names */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties
}

/**
 * Topology Left Sidebar (Stylebook §0.1, Ch.4 & app-pages/topology.html)
 *
 * Scaffolds the left column of the 3-column workspace with tab headers
 * and the interactive Device Directory (Tab Thiết bị).
 */
export const TopologyLeftSidebar: React.FC<TopologyLeftSidebarProps> = ({
  incidentId,
  nodes = [],
  selectedNodeId,
  onSelectDevice = () => {},
  locale = 'vi',
  className,
  style,
}) => {
  const isEn = locale === 'en'

  // Available tabs depend on whether an incident context is elevated
  const defaultTab = incidentId ? 'timeline' : 'inventory'
  const [activeTab, setActiveTab] = useState<string>(defaultTab)

  const tabs = incidentId
    ? [
        { id: 'timeline', label: isEn ? 'Timeline' : 'Timeline' },
        { id: 'hypothesis', label: isEn ? 'Hypothesis' : 'Giả thuyết' },
        { id: 'inventory', label: isEn ? 'Devices' : 'Thiết bị' },
        { id: 'layers', label: isEn ? 'Display' : 'Hiển thị' },
      ]
    : [
        { id: 'inventory', label: isEn ? 'Devices' : 'Thiết bị' },
        { id: 'layers', label: isEn ? 'Display' : 'Hiển thị' },
      ]

  return (
    <aside
      className={cn(
        'w-64 shrink-0 flex flex-col h-full select-none',
        'bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800',
        'p-3.5 overflow-hidden transition-colors duration-150',
        className
      )}
      style={style}
      data-testid="topology-left-sidebar"
    >
      {/* 1. Header & Region Identifier */}
      <div className="mb-3 shrink-0">
        <div className="font-mono text-[11px] font-extrabold tracking-wider text-slate-800 dark:text-[#94a3b8] uppercase">
          {isEn ? 'LEFT SIDEBAR' : 'SIDEBAR TRÁI'}
        </div>
        <div className="font-mono text-[9px] font-bold tracking-widest text-slate-400 dark:text-[#64748b] uppercase mt-0.5">
          {isEn ? 'NAVIGATION · CHAPTER 4' : 'ĐIỀU HƯỚNG · CHƯƠNG 4'}
        </div>
      </div>

      {/* 2. Tab Navigation Bar */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg mb-3 shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              data-testid={`left-sidebar-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-1 text-center font-mono text-[10px] font-bold tracking-wide rounded transition-all outline-none cursor-pointer',
                isActive
                  ? 'bg-white dark:bg-[#0f172a] text-[#1d4ed8] dark:text-[#38bdf8] shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'inventory' ? (
        <DeviceDirectoryTab
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectDevice={onSelectDevice}
          locale={locale}
        />
      ) : activeTab === 'layers' ? (
        /* Tab Hiển thị (Display & Layer Toggles Placeholder) */
        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto no-scrollbar">
          <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase">
            {isEn ? 'DISPLAY SETTINGS · CHAPTER 4.4' : 'CÀI ĐẶT HIỂN THỊ · MỤC 4.4'}
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 dark:text-slate-300">
                {isEn ? 'Tier Bands' : 'Dải phân tầng'}
              </span>
              <span className="text-emerald-500 font-bold">ON</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 dark:text-slate-300">
                {isEn ? 'Center Lines' : 'Đường trung tâm'}
              </span>
              <span className="text-emerald-500 font-bold">ON</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-700 dark:text-slate-300">
                {isEn ? 'Device Counts' : 'Số lượng thiết bị'}
              </span>
              <span className="text-emerald-500 font-bold">ON</span>
            </div>
          </div>

          <div className="mt-auto p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            💡 <strong>{isEn ? 'Chapter 4.4 Spec:' : 'Đặc tả Mục 4.4:'}</strong>{' '}
            {isEn
              ? 'Display toggles and k-hop dials will be enhanced in the next iteration.'
              : 'Các tuỳ chọn bật/tắt dải tầng và bộ lọc hiển thị sẽ được kết nối ở bước kế tiếp.'}
          </div>
        </div>
      ) : (
        /* Incident Mode Tabs Placeholder (Timeline / Hypothesis) */
        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto no-scrollbar">
          <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase">
            {activeTab.toUpperCase()} · PLACEHOLDER
          </div>

          <div className="p-2.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
            <div className="h-2.5 rounded bg-slate-200 dark:bg-slate-800 w-full animate-pulse" />
            <div className="h-2 rounded bg-slate-200/70 dark:bg-slate-800/70 w-3/4" />
            <div className="h-2 rounded bg-slate-200/70 dark:bg-slate-800/70 w-5/6" />
          </div>

          <div className="mt-auto p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            💡 <strong>{isEn ? 'Incident Context:' : 'Ngữ cảnh Sự cố:'}</strong>{' '}
            {incidentId}
          </div>
        </div>
      )}
    </aside>
  )
}

