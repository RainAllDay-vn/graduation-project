import React from 'react'
import { cn } from '@/lib/utils'
import type { KHopDistance, KHopFilterMode } from '../canvas/egoNetwork'

export interface DisplaySettings {
  /** Show the 5 horizontal stratified boundary boxes and tier titles */
  showTierBands: boolean
  /** Show the horizontal dashed centerline guidelines */
  showCenterlines: boolean
  /** Show the device count badges on each tier */
  showCounts: boolean
  /** Show the physical port interface names (sPort ⇄ tPort) on links */
  showPortLabels: boolean
}

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  showTierBands: true,
  showCenterlines: true,
  showCounts: true,
  showPortLabels: true,
}

export interface DisplaySettingsTabProps {
  settings: DisplaySettings
  onSettingChange: <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => void
  kHop?: KHopDistance
  filterMode?: KHopFilterMode
  onKHopChange?: (kHop: KHopDistance) => void
  onFilterModeChange?: (mode: KHopFilterMode) => void
  onResetDefaults?: () => void
  locale?: 'vi' | 'en'
  className?: string
}

/**
 * Tab Hiển thị (Display Settings & Visual Toggles)
 * Stylebook §0.1, Ch.4.4 & app-pages/topology.html
 */
export const DisplaySettingsTab: React.FC<DisplaySettingsTabProps> = ({
  settings,
  onSettingChange,
  kHop = 'all',
  filterMode = 'ghost',
  onKHopChange,
  onFilterModeChange,
  onResetDefaults,
  locale = 'vi',
  className,
}) => {
  const isEn = locale === 'en'

  const toggleItems: Array<{
    key: keyof DisplaySettings
    label: string
    desc: string
    testId: string
  }> = [
    {
      key: 'showTierBands',
      label: isEn ? 'Tier Bands' : 'Dải phân tầng',
      desc: isEn ? '5 stratified hierarchy bands & titles' : '5 dải phân cấp viễn thông & tiêu đề tầng',
      testId: 'toggle-tier-bands',
    },
    {
      key: 'showCenterlines',
      label: isEn ? 'Center Lines' : 'Đường trung tâm',
      desc: isEn ? 'Horizontal dashed tier guidelines' : 'Trục toạ độ nét đứt chạy ngang tâm tầng',
      testId: 'toggle-centerlines',
    },
    {
      key: 'showCounts',
      label: isEn ? 'Device Counts' : 'Số lượng thiết bị',
      desc: isEn ? 'Tier node counter indicator' : 'Chỉ số đếm tổng thiết bị trên mỗi tầng',
      testId: 'toggle-device-counts',
    },
    {
      key: 'showPortLabels',
      label: isEn ? 'Port Labels' : 'Nhãn cổng',
      desc: isEn ? 'Physical interfaces (sPort ⇄ tPort)' : 'Giao diện cổng vật lý ở hai đầu liên kết',
      testId: 'toggle-port-labels',
    },
  ]

  const khopOptions: Array<{ value: KHopDistance; label: string }> = [
    { value: 1, label: '1-Hop' },
    { value: 2, label: '2-Hop' },
    { value: 3, label: '3-Hop' },
    { value: 'all', label: isEn ? 'All' : 'Tất cả' },
  ]

  return (
    <div
      className={cn('flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar pr-0.5', className)}
      data-testid="display-settings-tab"
    >
      {/* 1. Section: Visual Elements Toggles */}
      <div className="space-y-2">
        <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-500 dark:text-[#64748b] uppercase">
          {isEn ? 'VISUAL TOGGLES' : 'TÙY CHỌN TRỰC QUAN'}
        </div>

        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-3">
          {toggleItems.map((item) => {
            const isChecked = !!settings[item.key]
            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-2 select-none group"
              >
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                  <span className="font-sans text-[10px] text-slate-600 dark:text-slate-400 leading-tight">
                    {item.desc}
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isChecked}
                  data-testid={item.testId}
                  onClick={() => onSettingChange(item.key, !isChecked)}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
                    isChecked
                      ? 'bg-sky-500 dark:bg-sky-400'
                      : 'bg-slate-300 dark:bg-slate-700'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                      isChecked ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Section: k-Hop Ego-Network Radius */}
      <div className="space-y-2">
        <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-500 dark:text-[#64748b] uppercase">
          {isEn ? 'HOP RADIUS (k-HOP)' : 'BÁN KÍNH BƯỚC NHẢY (k-HOP)'}
        </div>

        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
          {khopOptions.map((opt) => {
            const isActive = kHop === opt.value
            return (
              <button
                key={String(opt.value)}
                type="button"
                data-testid={`display-khop-${opt.value}`}
                onClick={() => onKHopChange?.(opt.value)}
                className={cn(
                  'py-1 text-center font-mono text-[10.5px] font-bold rounded transition-all cursor-pointer',
                  isActive
                    ? 'bg-sky-500 text-white shadow-xs dark:bg-sky-400 dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Section: Non-Focus Node Culling/Ghosting */}
      <div className="space-y-2">
        <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-500 dark:text-[#64748b] uppercase">
          {isEn ? 'NON-FOCUS NODES' : 'NODE NGOÀI TIÊU ĐIỂM'}
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
          <button
            type="button"
            data-testid="display-filter-ghost"
            onClick={() => onFilterModeChange?.('ghost')}
            className={cn(
              'py-1 px-1.5 text-center font-mono text-[10px] font-bold rounded transition-all cursor-pointer',
              filterMode === 'ghost'
                ? 'bg-sky-500 text-white shadow-xs dark:bg-sky-400 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            )}
          >
            {isEn ? 'Ghost (15%)' : 'Làm mờ (15%)'}
          </button>
          <button
            type="button"
            data-testid="display-filter-prune"
            onClick={() => onFilterModeChange?.('prune')}
            className={cn(
              'py-1 px-1.5 text-center font-mono text-[10px] font-bold rounded transition-all cursor-pointer',
              filterMode === 'prune'
                ? 'bg-sky-500 text-white shadow-xs dark:bg-sky-400 dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            )}
          >
            {isEn ? 'Prune (0%)' : 'Ẩn hoàn toàn'}
          </button>
        </div>
      </div>

      {/* 4. Section: Reset Defaults Action */}
      <div className="mt-auto pt-2">
        <button
          type="button"
          data-testid="display-reset-defaults-btn"
          onClick={onResetDefaults}
          className="w-full py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10.5px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isEn ? 'Reset to Defaults' : 'Khôi phục mặc định'}
        </button>
      </div>
    </div>
  )
}
