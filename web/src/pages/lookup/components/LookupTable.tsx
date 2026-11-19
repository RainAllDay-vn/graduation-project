import type { DeviceSummary, LinkSummary } from '@/api/topology'
import type { NetworkServiceSummary } from '@/api/services'
import {
  type LookupTab,
  getDeviceStatusBadge,
  getLinkStatusBadge,
  getServiceStatusBadge,
  formatDeviceLayer,
  formatLinkType,
  formatServiceType,
  formatRxPower,
  formatCapacity,
  formatUtilization,
  formatSubscribers,
} from './lookupUtils'
import { ArrowRight, Inbox, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

export interface LookupTableProps {
  activeTab: LookupTab
  devices: DeviceSummary[]
  links: LinkSummary[]
  services: NetworkServiceSummary[]
  selectedId?: string | null
  isLoading?: boolean
  locale?: 'vi' | 'en'
  onSelect: (id: string) => void
  onResetFilters?: () => void
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

export function LookupTable({
  activeTab,
  devices,
  links,
  services,
  selectedId,
  isLoading = false,
  locale = 'vi',
  onSelect,
  onResetFilters,
  page = 0,
  totalPages = 0,
  onPageChange,
}: LookupTableProps) {
  const isEn = locale === 'en'

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs">
        <div className="h-10 bg-[#f8fafc] dark:bg-[#0b0f19] border-b border-[#e2e8f0] dark:border-[#1e293b] px-4 flex items-center">
          <div className="h-3.5 bg-slate-200 dark:bg-[#1e293b] rounded w-1/4 animate-pulse" />
        </div>
        <div className="divide-y divide-[#f1f5f9] dark:divide-[#1e293b] p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-[#1e293b] rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-slate-100 dark:bg-[#334155]/40 rounded w-1/4 animate-pulse" />
              </div>
              <div className="h-5 bg-slate-100 dark:bg-[#334155]/40 rounded w-24 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Count check for current tab
  const currentCount =
    activeTab === 'devices'
      ? devices.length
      : activeTab === 'links'
      ? links.length
      : services.length

  // Empty state
  if (currentCount === 0) {
    return (
      <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
          <Inbox className="w-6 h-6" />
        </div>
        <div className="font-bold text-[14px] text-[#0f172a] dark:text-[#f8fafc] mt-3">
          {isEn ? 'No matching resources found.' : 'Không có kết quả nào khớp.'}
        </div>
        <div className="text-[12.5px] text-[#64748b] dark:text-[#94a3b8] mt-1">
          {isEn
            ? 'Try a different keyword or remove some filters.'
            : 'Thử từ khóa khác hoặc bỏ bớt bộ lọc.'}
        </div>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 bg-[#f1f5f9] dark:bg-[#1e293b] hover:bg-[#e2e8f0] dark:hover:bg-[#334155] text-[12.5px] font-bold text-[#0f172a] dark:text-[#f8fafc] rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            {isEn ? 'Clear keyword & filters' : 'Xóa từ khóa & bộ lọc'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#e2e8f0] dark:border-[#1e293b] bg-[#f8fafc] dark:bg-[#0b0f19] text-[11px] font-mono font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8] uppercase select-none">
              {activeTab === 'devices' && (
                <>
                  <th className="py-3 px-4 min-w-[200px]">
                    {isEn ? 'OBJECT' : 'ĐỐI TƯỢNG'}
                  </th>
                  <th className="py-3 px-4 min-w-[140px]">
                    {isEn ? 'TYPE' : 'LOẠI'}
                  </th>
                  <th className="py-3 px-4 min-w-[130px]">
                    {isEn ? 'REGION' : 'KHU VỰC'}
                  </th>
                  <th className="py-3 px-4 text-right min-w-[130px]">
                    {isEn ? 'STATUS' : 'TRẠNG THÁI'}
                  </th>
                </>
              )}

              {activeTab === 'links' && (
                <>
                  <th className="py-3 px-4 min-w-[220px]">
                    {isEn ? 'LINK' : 'LIÊN KẾT'}
                  </th>
                  <th className="py-3 px-4 min-w-[120px]">
                    {isEn ? 'TYPE' : 'LOẠI'}
                  </th>
                  <th className="py-3 px-4 min-w-[130px]">
                    {isEn ? 'BANDWIDTH' : 'BĂNG THÔNG'}
                  </th>
                  <th className="py-3 px-4 min-w-[110px]">
                    {isEn ? 'RX POWER' : 'SUY HAO RX'}
                  </th>
                  <th className="py-3 px-4 text-right min-w-[120px]">
                    {isEn ? 'STATUS' : 'TRẠNG THÁI'}
                  </th>
                </>
              )}

              {activeTab === 'services' && (
                <>
                  <th className="py-3 px-4 min-w-[220px]">
                    {isEn ? 'SERVICE' : 'DỊCH VỤ'}
                  </th>
                  <th className="py-3 px-4 min-w-[150px]">
                    {isEn ? 'TYPE' : 'LOẠI'}
                  </th>
                  <th className="py-3 px-4 min-w-[120px]">
                    {isEn ? 'REGION' : 'KHU VỰC'}
                  </th>
                  <th className="py-3 px-4 min-w-[130px]">
                    {isEn ? 'SUBSCRIBERS' : 'QUY MÔ'}
                  </th>
                  <th className="py-3 px-4 text-right min-w-[120px]">
                    {isEn ? 'STATUS' : 'TRẠNG THÁI'}
                  </th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f1f5f9] dark:divide-[#1e293b] text-[13px]">
            {/* Devices rows */}
            {activeTab === 'devices' &&
              devices.map((device) => {
                const isSelected = selectedId === device.id
                const badge = getDeviceStatusBadge(device.status, locale)
                const layerInfo = formatDeviceLayer(device.layer, locale)

                return (
                  <tr
                    key={device.id}
                    onClick={() => onSelect(device.id)}
                    className={`group transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/30'
                        : 'hover:bg-slate-50/70 dark:hover:bg-[#1e293b]/40'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[13px] text-[#0f172a] dark:text-[#f8fafc]">
                          {device.name}
                        </span>
                        <span className="font-mono text-[11px] text-[#64748b] dark:text-[#94a3b8]">
                          ({device.id})
                        </span>
                      </div>
                      <div className="text-[12px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                        {device.model} · {device.ipAddress}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                        {layerInfo.description}
                      </div>
                      <div className="text-[11px] font-mono text-[#64748b] dark:text-[#94a3b8]">
                        Layer: {device.layer}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[#0f172a] dark:text-[#f8fafc]">
                        {device.site}
                      </div>
                      <div className="text-[12px] text-[#64748b] dark:text-[#94a3b8]">
                        {device.region}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}

            {/* Links rows */}
            {activeTab === 'links' &&
              links.map((link) => {
                const isSelected = selectedId === link.linkId
                const badge = getLinkStatusBadge(link.operStatus, locale)
                const rx = formatRxPower(link.rxPowerDbm)
                const util = formatUtilization(link.utilizationPercent)

                return (
                  <tr
                    key={link.linkId}
                    onClick={() => onSelect(link.linkId)}
                    className={`group transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/30'
                        : 'hover:bg-slate-50/70 dark:hover:bg-[#1e293b]/40'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-[13px] text-[#0f172a] dark:text-[#f8fafc]">
                        <span>{link.sourceDeviceId}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#94a3b8]" />
                        <span>{link.targetDeviceId}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                        {link.linkId} ({link.sourcePort} ⇄ {link.targetPort})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[#0f172a] dark:text-[#f8fafc]">
                        {formatLinkType(link.linkType, locale)}
                      </div>
                      {link.isBackup && (
                        <span className="inline-block mt-0.5 font-mono text-[10px] text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 px-1 rounded">
                          {isEn ? 'BACKUP' : 'DỰ PHÒNG'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[#0f172a] dark:text-[#f8fafc]">
                        {formatCapacity(link.capacityGbps)}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                        <span
                          className={
                            util.isCritical
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : util.isWarning
                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-[#64748b] dark:text-[#94a3b8]'
                          }
                        >
                          {util.formatted}
                        </span>
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              util.isCritical
                                ? 'bg-rose-500'
                                : util.isWarning
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(0, link.utilizationPercent || 0)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div
                        className={`font-mono text-[12px] flex items-center gap-1 ${
                          rx.isCritical
                            ? 'text-rose-600 dark:text-rose-400 font-bold'
                            : rx.isWarning
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-[#0f172a] dark:text-[#f8fafc]'
                        }`}
                      >
                        {rx.formatted}
                        {(rx.isWarning || rx.isCritical) && (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}

            {/* Services rows */}
            {activeTab === 'services' &&
              services.map((svc) => {
                const isSelected = selectedId === svc.id
                const badge = getServiceStatusBadge(svc.status, locale)

                return (
                  <tr
                    key={svc.id}
                    onClick={() => onSelect(svc.id)}
                    className={`group transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/30'
                        : 'hover:bg-slate-50/70 dark:hover:bg-[#1e293b]/40'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[13px] text-[#0f172a] dark:text-[#f8fafc]">
                          {svc.name}
                        </span>
                        <span className="font-mono text-[11px] text-[#64748b] dark:text-[#94a3b8]">
                          ({svc.id})
                        </span>
                      </div>
                      {svc.description && (
                        <div className="text-[12px] text-[#64748b] dark:text-[#94a3b8] mt-0.5 line-clamp-1">
                          {svc.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                        {formatServiceType(svc.type, locale)}
                      </div>
                      <div className="text-[11px] font-mono text-[#64748b] dark:text-[#94a3b8]">
                        {svc.type}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#0f172a] dark:text-[#f8fafc]">
                      {svc.region}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                        {formatSubscribers(svc.subscriberCount, locale)}{' '}
                        <span className="text-[11px] font-sans font-normal text-[#64748b] dark:text-[#94a3b8]">
                          {isEn ? 'subs' : 'thuê bao'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                        {svc.dependentDeviceCount}{' '}
                        {isEn ? 'devices' : 'thiết bị phụ thuộc'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-block font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {activeTab === 'devices' && onPageChange && totalPages > 1 && (
        <div className="border-t border-[#e2e8f0] dark:border-[#1e293b] px-4 py-2.5 flex items-center justify-between">
          <span className="text-[11.5px] text-[#64748b] dark:text-[#94a3b8]">
            {isEn ? 'Page' : 'Trang'} {page + 1} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-[#1e293b] text-[#0f172a] dark:text-[#f8fafc] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-colors cursor-pointer"
              aria-label={isEn ? 'Previous page' : 'Trang trước'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg border border-[#e2e8f0] dark:border-[#1e293b] text-[#0f172a] dark:text-[#f8fafc] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-colors cursor-pointer"
              aria-label={isEn ? 'Next page' : 'Trang sau'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
