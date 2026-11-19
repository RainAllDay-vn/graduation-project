import React, { useMemo, useState } from 'react'
import type { DeviceSummary } from '@/api/topology'
import { cn } from '@/lib/utils'
import { Search, X, Server } from 'lucide-react'
import { DeviceRow } from './DeviceRow'

export type TierFilterType = 'ALL' | 'BORDER' | 'CORE' | 'AGG' | 'EXCH'

export interface DeviceDirectoryTabProps {
  nodes: DeviceSummary[]
  selectedNodeId?: string | null
  onSelectDevice: (device: DeviceSummary) => void
  locale?: 'vi' | 'en'
  className?: string
}

export const DeviceDirectoryTab: React.FC<DeviceDirectoryTabProps> = ({
  nodes,
  selectedNodeId,
  onSelectDevice,
  locale = 'vi',
  className,
}) => {
  const isEn = locale === 'en'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTier, setSelectedTier] = useState<TierFilterType>('ALL')

  // Tier filter chips specification
  const tierChips: { id: TierFilterType; label: string }[] = [
    { id: 'ALL', label: isEn ? 'ALL' : 'TẤT CẢ' },
    { id: 'BORDER', label: isEn ? 'BORDER' : 'BIÊN' },
    { id: 'CORE', label: 'CORE' },
    { id: 'AGG', label: 'AGG' },
    { id: 'EXCH', label: 'EXCH' },
  ]

  // Filter and sort devices alphabetically A→Z
  const filteredDevices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return nodes
      .filter((device) => {
        // 1. Tier filter
        if (selectedTier === 'BORDER') {
          if (device.layer !== 'PEER' && device.layer !== 'IGW') return false
        } else if (selectedTier === 'CORE') {
          if (device.layer !== 'CORE') return false
        } else if (selectedTier === 'AGG') {
          if (device.layer !== 'AGGREGATION') return false
        } else if (selectedTier === 'EXCH') {
          if (device.layer !== 'EXCHANGE' && device.layer !== 'ACCESS') return false
        }

        // 2. Search query filter
        if (query) {
          const matchId = device.id.toLowerCase().includes(query)
          const matchIp = device.ipAddress?.toLowerCase().includes(query)
          const matchSite = device.site?.toLowerCase().includes(query)
          const matchName = device.name?.toLowerCase().includes(query)
          const matchModel = device.model?.toLowerCase().includes(query)
          if (!matchId && !matchIp && !matchSite && !matchName && !matchModel) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }))
  }, [nodes, selectedTier, searchQuery])

  const isFiltered = searchQuery.trim().length > 0 || selectedTier !== 'ALL'

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedTier('ALL')
  }

  return (
    <div
      className={cn('flex-1 flex flex-col min-h-0 select-none', className)}
      data-testid="device-directory-tab"
    >
      {/* 1. Search Bar */}
      <div className="relative mb-2.5">
        <div className="h-8 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 px-2.5 flex items-center gap-2 focus-within:border-sky-500/80 focus-within:ring-1 focus-within:ring-sky-500/20 transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            data-testid="device-directory-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search router, IP, site…' : 'Tìm router, IP, site…'}
            className="w-full bg-transparent text-[11px] font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              data-testid="device-directory-search-clear"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Tier Filter Chips */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto no-scrollbar py-0.5">
        {tierChips.map((chip) => {
          const isActive = selectedTier === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              data-testid={`device-filter-chip-${chip.id.toLowerCase()}`}
              onClick={() => setSelectedTier(chip.id)}
              className={cn(
                'px-2 py-0.5 rounded text-[9.5px] font-mono font-bold whitespace-nowrap transition-all outline-none cursor-pointer',
                isActive
                  ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 shadow-xs'
                  : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent'
              )}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {/* 3. Section Title & Counter */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase">
          {isEn ? 'ROUTERS A→Z' : 'DANH MỤC A→Z'}
        </span>
        <span className="font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400">
          {isFiltered ? `${filteredDevices.length}/${nodes.length}` : `${nodes.length}`}{' '}
          {isEn ? 'DEVICES' : 'THIẾT BỊ'}
        </span>
      </div>

      {/* 4. Device List / Empty State */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar space-y-1 pr-0.5"
        data-testid="device-directory-list"
      >
        {filteredDevices.length > 0 ? (
          filteredDevices.map((device) => (
            <DeviceRow
              key={device.id}
              device={device}
              isSelected={selectedNodeId === device.id}
              onClick={onSelectDevice}
              locale={locale}
            />
          ))
        ) : (
          <div
            className="p-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center my-4"
            data-testid="device-directory-empty"
          >
            <Server className="w-6 h-6 text-slate-300 dark:text-slate-600 mb-2" />
            <span className="font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              {isEn ? 'No matching routers' : 'Không tìm thấy router'}
            </span>
            <p className="font-sans text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 max-w-[180px]">
              {isEn
                ? 'Try adjusting your search query or tier filters.'
                : 'Thử đổi từ khóa tìm kiếm hoặc bỏ chọn lọc tầng.'}
            </p>
            {isFiltered && (
              <button
                type="button"
                data-testid="device-directory-reset-btn"
                onClick={handleResetFilters}
                className="mt-2.5 px-2.5 py-1 text-[10px] font-mono font-bold rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25 transition-colors cursor-pointer"
              >
                {isEn ? 'Reset filters' : 'Xoá bộ lọc'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
