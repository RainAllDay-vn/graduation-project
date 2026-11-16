import type { LookupTab } from './lookupUtils'
import { Search, X, RotateCcw } from 'lucide-react'

export interface LookupFilterBarProps {
  activeTab: LookupTab
  searchQuery: string
  onSearchChange: (query: string) => void
  layerFilter: string
  onLayerChange: (layer: string) => void
  typeFilter: string
  onTypeChange: (type: string) => void
  regionFilter: string
  onRegionChange: (region: string) => void
  statusFilter: string
  onStatusChange: (status: string) => void
  availableRegions?: string[]
  locale?: 'vi' | 'en'
  onResetFilters: () => void
}

export function LookupFilterBar({
  activeTab,
  searchQuery,
  onSearchChange,
  layerFilter,
  onLayerChange,
  typeFilter,
  onTypeChange,
  regionFilter,
  onRegionChange,
  statusFilter,
  onStatusChange,
  availableRegions = [],
  locale = 'vi',
  onResetFilters,
}: LookupFilterBarProps) {
  const isEn = locale === 'en'

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    (activeTab === 'devices' &&
      (layerFilter !== 'ALL' || regionFilter !== 'ALL' || statusFilter !== 'ALL')) ||
    (activeTab === 'links' && (typeFilter !== 'ALL' || statusFilter !== 'ALL')) ||
    (activeTab === 'services' &&
      (typeFilter !== 'ALL' || regionFilter !== 'ALL' || statusFilter !== 'ALL'))

  // Device Layer Options
  const layerOptions = [
    { value: 'ALL', label: isEn ? 'Layer: All' : 'Lớp: Tất cả' },
    { value: 'CORE', label: isEn ? 'Core' : 'Lõi (Core)' },
    { value: 'AGGREGATION', label: isEn ? 'Aggregation' : 'Tổng hợp (Agg)' },
    { value: 'ACCESS', label: isEn ? 'Access' : 'Truy nhập (Access)' },
    { value: 'PEER', label: isEn ? 'Peering' : 'Ngang hàng (Peer)' },
    { value: 'IGW', label: isEn ? 'International (IGW)' : 'Quốc tế (IGW)' },
    { value: 'EXCHANGE', label: isEn ? 'Exchange (IX)' : 'Trung chuyển (IX)' },
  ]

  // Link Type Options
  const linkTypeOptions = [
    { value: 'ALL', label: isEn ? 'Type: All' : 'Loại: Tất cả' },
    { value: 'PHYSICAL_FIBER', label: isEn ? 'Fiber Optical' : 'Cáp quang (Fiber)' },
    { value: 'LOGICAL_IP', label: isEn ? 'Logical IP' : 'Tuyến IP Logic' },
  ]

  // Service Type Options
  const serviceTypeOptions = [
    { value: 'ALL', label: isEn ? 'Service: All' : 'Dịch vụ: Tất cả' },
    { value: 'INTERNET_TRANSIT', label: 'Internet Transit' },
    { value: 'VPN_MPLS', label: isEn ? 'MPLS VPN' : 'VPN / MPLS' },
    { value: 'VOIP', label: isEn ? 'VoIP Service' : 'Thoại IP (VoIP)' },
    { value: 'IPTV', label: isEn ? 'IPTV / OTT' : 'Truyền hình IPTV' },
    { value: 'CLOUD_CONNECT', label: 'Cloud Connect' },
    { value: 'DATACENTER', label: isEn ? 'Data Center' : 'Kết nối Data Center' },
    { value: 'DNS', label: isEn ? 'Core DNS' : 'Hạ tầng DNS' },
  ]

  // Status Options depending on active tab
  const getStatusOptions = () => {
    if (activeTab === 'devices') {
      return [
        { value: 'ALL', label: isEn ? 'Status: All' : 'Trạng thái: Tất cả' },
        { value: 'ACTIVE', label: isEn ? 'Active' : 'Hoạt động' },
        { value: 'DEGRADED', label: isEn ? 'Degraded' : 'Cảnh báo' },
        { value: 'CRITICAL', label: isEn ? 'Critical' : 'Sự cố' },
      ]
    }
    if (activeTab === 'links') {
      return [
        { value: 'ALL', label: isEn ? 'Status: All' : 'Trạng thái: Tất cả' },
        { value: 'UP', label: isEn ? 'Up / Operational' : 'Hoạt động (UP)' },
        { value: 'DEGRADED', label: isEn ? 'Degraded' : 'Cảnh báo' },
        { value: 'DOWN', label: isEn ? 'Down' : 'Mất kết nối (DOWN)' },
      ]
    }
    return [
      { value: 'ALL', label: isEn ? 'Status: All' : 'Trạng thái: Tất cả' },
      { value: 'OPERATIONAL', label: isEn ? 'Operational' : 'Hoạt động' },
      { value: 'DEGRADED', label: isEn ? 'Degraded' : 'Cảnh báo' },
      { value: 'OUTAGE', label: isEn ? 'Outage' : 'Gián đoạn' },
    ]
  }

  // Region options
  const defaultRegions = ['Miền Bắc', 'Miền Trung', 'Miền Nam', 'Quốc tế']
  const mergedRegions = Array.from(new Set([...defaultRegions, ...availableRegions]))
  const regionOptions = [
    { value: 'ALL', label: isEn ? 'Region: All' : 'Khu vực: Tất cả' },
    ...mergedRegions.map((r) => ({ value: r, label: r })),
  ]

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              isEn
                ? 'Search by name, ID, IP, description…'
                : 'Tìm theo tên, ID, IP, mô tả…'
            }
            className="w-full h-10 pl-10 pr-9 bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded-lg text-[13px] text-[#0f172a] dark:text-[#f8fafc] placeholder-[#94a3b8] dark:placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:border-transparent transition shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] dark:hover:text-[#cbd5e1] p-0.5 cursor-pointer"
              title={isEn ? 'Clear search' : 'Xóa tìm kiếm'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dynamic Filters depending on Tab */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layer Filter (Devices) */}
          {activeTab === 'devices' && (
            <select
              aria-label={isEn ? 'Filter by layer' : 'Lọc theo lớp thiết bị'}
              value={layerFilter}
              onChange={(e) => onLayerChange(e.target.value)}
              className="h-10 px-3 py-1.5 bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded-lg text-[12.5px] font-semibold text-[#334155] dark:text-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] cursor-pointer shadow-xs"
            >
              {layerOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Link Type Filter (Links) */}
          {activeTab === 'links' && (
            <select
              aria-label={isEn ? 'Filter by link type' : 'Lọc theo loại liên kết'}
              value={typeFilter}
              onChange={(e) => onTypeChange(e.target.value)}
              className="h-10 px-3 py-1.5 bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded-lg text-[12.5px] font-semibold text-[#334155] dark:text-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] cursor-pointer shadow-xs"
            >
              {linkTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Service Type Filter (Services) */}
          {activeTab === 'services' && (
            <select
              aria-label={isEn ? 'Filter by service type' : 'Lọc theo loại dịch vụ'}
              value={typeFilter}
              onChange={(e) => onTypeChange(e.target.value)}
              className="h-10 px-3 py-1.5 bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded-lg text-[12.5px] font-semibold text-[#334155] dark:text-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] cursor-pointer shadow-xs"
            >
              {serviceTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Region Filter (Devices & Services) */}
          {(activeTab === 'devices' || activeTab === 'services') && (
            <select
              aria-label={isEn ? 'Filter by region' : 'Lọc theo khu vực'}
              value={regionFilter}
              onChange={(e) => onRegionChange(e.target.value)}
              className="h-10 px-3 py-1.5 bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded-lg text-[12.5px] font-semibold text-[#334155] dark:text-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] cursor-pointer shadow-xs"
            >
              {regionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter (All Tabs) */}
          <select
            aria-label={isEn ? 'Filter by status' : 'Lọc theo trạng thái'}
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="h-10 px-3 py-1.5 bg-white dark:bg-[#0f172a] border border-[#cbd5e1] dark:border-[#334155] rounded-lg text-[12.5px] font-semibold text-[#334155] dark:text-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] cursor-pointer shadow-xs"
          >
            {getStatusOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="h-10 px-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#64748b] dark:text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-[#f8fafc] bg-[#f1f5f9] dark:bg-[#1e293b] hover:bg-[#e2e8f0] dark:hover:bg-[#334155] rounded-lg transition-colors cursor-pointer"
              title={isEn ? 'Reset all filters' : 'Xóa tất cả bộ lọc'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEn ? 'Reset' : 'Đặt lại'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
