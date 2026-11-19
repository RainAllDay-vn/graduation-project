import React, { useState } from 'react'
import { cn } from '@/lib/utils'

export interface TopologyLeftSidebarProps {
  /** Optional ID of active incident (unlocks Timeline & Hypothesis tabs) */
  incidentId?: string | null
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
 * and clean placeholder text/wireframe bars.
 */
export const TopologyLeftSidebar: React.FC<TopologyLeftSidebarProps> = ({
  incidentId,
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
        'p-3.5 overflow-y-auto no-scrollbar transition-colors duration-150',
        className
      )}
      style={style}
      data-testid="topology-left-sidebar"
    >
      {/* 1. Header & Region Identifier */}
      <div className="mb-3">
        <div className="font-mono text-[11px] font-extrabold tracking-wider text-slate-800 dark:text-[#94a3b8] uppercase">
          {isEn ? 'LEFT SIDEBAR' : 'SIDEBAR TRÁI'}
        </div>
        <div className="font-mono text-[9px] font-bold tracking-widest text-slate-400 dark:text-[#64748b] uppercase mt-0.5">
          {isEn ? 'NAVIGATION · CHAPTER 4' : 'ĐIỀU HƯỚNG · CHƯƠNG 4'}
        </div>
      </div>

      {/* 2. Tab Navigation Bar */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg mb-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-1 text-center font-mono text-[10px] font-bold tracking-wide rounded transition-all outline-none',
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

      {/* 3. Search Bar Placeholder */}
      <div className="h-8 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 px-2.5 flex items-center justify-between text-slate-400 dark:text-slate-500 text-[11px] font-mono mb-3">
        <span>{isEn ? 'Search router, IP, site…' : 'Tìm router, IP, site…'}</span>
        <span className="w-1.5 h-3 bg-slate-400 dark:bg-slate-500 animate-pulse" />
      </div>

      {/* 4. Tier Filter Chips Placeholder */}
      <div className="flex items-center gap-1 mb-3.5 overflow-x-auto no-scrollbar">
        {['TẤT CẢ', 'CORE', 'AGG', 'EXCH', 'BIÊN'].map((tier, idx) => (
          <span
            key={tier}
            className={cn(
              'px-2 py-0.5 rounded text-[9.5px] font-mono font-bold whitespace-nowrap',
              idx === 0
                ? 'bg-[#1d4ed8]/10 text-[#1d4ed8] dark:text-sky-400 border border-[#1d4ed8]/30'
                : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60'
            )}
          >
            {tier}
          </span>
        ))}
      </div>

      {/* 5. Placeholder Directory Content & Wireframe Bars */}
      <div className="flex-1 flex flex-col gap-2.5">
        <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase">
          {isEn ? 'ACTIVE TAB CONTENT · PLACEHOLDER' : 'NỘI DUNG TAB ĐANG MỞ · PLACEHOLDER'}
        </div>

        {/* Skeleton items representing device rows */}
        <div className="p-2.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
          <div className="h-2.5 rounded bg-slate-200 dark:bg-slate-800 w-full animate-pulse" />
          <div className="h-2 rounded bg-slate-200/70 dark:bg-slate-800/70 w-3/4" />
          <div className="h-2 rounded bg-slate-200/70 dark:bg-slate-800/70 w-5/6" />
        </div>

        <div className="p-2.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
          <div className="h-2.5 rounded bg-slate-200 dark:bg-slate-800 w-4/5 animate-pulse" />
          <div className="h-2 rounded bg-slate-200/70 dark:bg-slate-800/70 w-2/3" />
        </div>

        <div className="p-2.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
          <div className="h-2.5 rounded bg-slate-200 dark:bg-slate-800 w-full animate-pulse" />
          <div className="h-2 rounded bg-slate-200/70 dark:bg-slate-800/70 w-1/2" />
        </div>

        {/* Informational Placeholder Callout */}
        <div className="mt-auto p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
          💡 <strong>{isEn ? 'Chapter 4 Spec:' : 'Đặc tả Chương 4:'}</strong>{' '}
          {isEn
            ? 'Device directory, dynamic timeline, and AI hypotheses will be integrated here.'
            : 'Danh mục thiết bị router, bộ lọc tầng L2/L3 và trục sự cố sẽ được kết nối tại đây.'}
        </div>
      </div>
    </aside>
  )
}
