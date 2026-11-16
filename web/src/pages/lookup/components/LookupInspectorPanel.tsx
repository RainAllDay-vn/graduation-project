import type { DeviceDetails, DeviceSummary, LinkSummary } from '@/api/topology'
import type { NetworkServiceDetails, NetworkServiceSummary, ServiceImpactReport } from '@/api/services'
import type { IncidentSummary } from '@/api/incidents'
import {
  type LookupTab,
  getDeviceStatusBadge,
  getLinkStatusBadge,
  getServiceStatusBadge,
  formatDeviceLayer,
  formatLinkType,
  formatServiceType,
  formatRxPower,
  formatTxPower,
  formatCapacity,
  formatUtilization,
  formatSubscribers,
} from './lookupUtils'
import {
  ExternalLink,
  Info,
  AlertTriangle,
  ArrowRight,
  Server,
  Network,
  Layers,
  Activity,
} from 'lucide-react'

export interface LookupInspectorPanelProps {
  activeTab: LookupTab
  selectedDevice?: (DeviceDetails | DeviceSummary) | null
  selectedLink?: LinkSummary | null
  selectedService?: (NetworkServiceDetails | NetworkServiceSummary) | null
  serviceImpact?: ServiceImpactReport | null
  correlatedIncident?: IncidentSummary | null
  isLoadingDetails?: boolean
  locale?: 'vi' | 'en'
  onNavigateToTopology: (target: {
    type: LookupTab
    id: string
    nodeId?: string
  }) => void
  onSelectDependentDevice?: (deviceId: string) => void
}

export function LookupInspectorPanel({
  activeTab,
  selectedDevice,
  selectedLink,
  selectedService,
  serviceImpact,
  correlatedIncident,
  isLoadingDetails = false,
  locale = 'vi',
  onNavigateToTopology,
  onSelectDependentDevice,
}: LookupInspectorPanelProps) {
  const isEn = locale === 'en'

  const hasSelection =
    (activeTab === 'devices' && Boolean(selectedDevice)) ||
    (activeTab === 'links' && Boolean(selectedLink)) ||
    (activeTab === 'services' && Boolean(selectedService))

  return (
    <aside
      aria-label={isEn ? 'Resource Details' : 'Chi tiết tài nguyên'}
      className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs flex flex-col transition-colors"
    >
      {/* Header */}
      <div className="font-mono text-[11px] font-extrabold tracking-[0.14em] text-[#64748b] dark:text-[#94a3b8] uppercase px-4 py-3 border-b border-[#e2e8f0] dark:border-[#1e293b] bg-[#f8fafc]/50 dark:bg-[#0b0f19]/50 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>{isEn ? 'INSPECTOR' : 'CHI TIẾT'}</span>
        </span>
        {hasSelection && (
          <span className="font-mono text-[10px] text-[#94a3b8] dark:text-[#64748b]">
            {activeTab === 'devices' && selectedDevice?.id}
            {activeTab === 'links' && selectedLink?.linkId}
            {activeTab === 'services' && selectedService?.id}
          </span>
        )}
      </div>

      {/* Body */}
      {isLoadingDetails ? (
        <div className="p-5 space-y-4 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="space-y-1.5 w-2/3">
              <div className="h-5 bg-slate-200 dark:bg-[#1e293b] rounded w-3/4" />
              <div className="h-3.5 bg-slate-100 dark:bg-[#334155]/40 rounded w-1/2" />
            </div>
            <div className="h-6 bg-slate-200 dark:bg-[#1e293b] rounded-full w-20" />
          </div>
          <div className="border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg p-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <div className="h-3 bg-slate-200 dark:bg-[#1e293b] rounded w-20" />
                <div className="h-3 bg-slate-100 dark:bg-[#334155]/40 rounded w-28" />
              </div>
            ))}
          </div>
          <div className="h-10 bg-slate-200 dark:bg-[#1e293b] rounded-lg w-full" />
        </div>
      ) : !hasSelection ? (
        <div className="p-8 text-center flex flex-col items-center justify-center my-auto min-h-[340px]">
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
            {activeTab === 'devices' && <Server className="w-6 h-6" />}
            {activeTab === 'links' && <Network className="w-6 h-6" />}
            {activeTab === 'services' && <Layers className="w-6 h-6" />}
          </div>
          <div className="font-bold text-[14px] text-[#0f172a] dark:text-[#f8fafc]">
            {isEn ? 'No resource selected.' : 'Chưa chọn đối tượng nào.'}
          </div>
          <div className="text-[12.5px] text-[#64748b] dark:text-[#94a3b8] mt-1 max-w-[240px]">
            {isEn
              ? 'Click any row in the table to inspect detailed telemetry here.'
              : 'Bấm một dòng trong bảng để xem chi tiết ở đây.'}
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5 flex flex-col gap-4">
          {/* DEVICE INSPECTION */}
          {activeTab === 'devices' && selectedDevice && (
            <>
              {/* Title row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-[18px] text-[#0f172a] dark:text-[#f8fafc] leading-tight font-mono">
                    {selectedDevice.name}
                  </h3>
                  <p className="text-[12.5px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                    {formatDeviceLayer(selectedDevice.layer, locale).description} ·{' '}
                    {selectedDevice.region}
                  </p>
                </div>
                {(() => {
                  const badge = getDeviceStatusBadge(selectedDevice.status, locale)
                  return (
                    <span
                      className={`font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )
                })()}
              </div>

              {/* Properties Box */}
              <div className="border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg divide-y divide-[#f1f5f9] dark:divide-[#1e293b] text-[12.5px] overflow-hidden">
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    IP ADDRESS
                  </span>
                  <span className="font-mono font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {selectedDevice.ipAddress}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    MODEL
                  </span>
                  <span className="font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {selectedDevice.model}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    SITE / POP
                  </span>
                  <span className="font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {selectedDevice.site}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    LAYER
                  </span>
                  <span className="font-mono font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {selectedDevice.layer}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    ACCESS DEVICES
                  </span>
                  <span className="font-mono font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {selectedDevice.accessDeviceCount}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    ACCESS ERRORS
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      (selectedDevice.accessErrorCount || 0) > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-[#0f172a] dark:text-[#f8fafc]'
                    }`}
                  >
                    {selectedDevice.accessErrorCount || 0}
                  </span>
                </div>
              </div>

              {/* Connected Links (if DeviceDetails with links is loaded) */}
              {'links' in selectedDevice && selectedDevice.links?.length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    {isEn ? 'DIRECT CONNECTIONS' : 'LIÊN KẾT TRỰC TIẾP'} (
                    {selectedDevice.links.length})
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedDevice.links.map((link) => (
                      <div
                        key={link.linkId}
                        className="flex items-center justify-between p-2 bg-[#f8fafc] dark:bg-[#0b0f19] border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg text-[11.5px]"
                      >
                        <div className="font-mono font-medium text-[#0f172a] dark:text-[#f8fafc] flex items-center gap-1.5">
                          <span>{link.sourcePort}</span>
                          <ArrowRight className="w-3 h-3 text-[#94a3b8]" />
                          <span>{link.targetDeviceId}</span>
                        </div>
                        <span
                          className={`font-mono text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                            link.operStatus?.toUpperCase() === 'UP'
                              ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40'
                              : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/40'
                          }`}
                        >
                          {link.operStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={() =>
                  onNavigateToTopology({
                    type: 'devices',
                    id: selectedDevice.id,
                    nodeId: selectedDevice.id,
                  })
                }
                className="w-full mt-2 py-2.5 px-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-[13px] rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isEn ? 'View in Topology →' : 'Xem trong topology →'}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </>
          )}

          {/* LINK INSPECTION */}
          {activeTab === 'links' && selectedLink && (
            <>
              {/* Title row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-[16px] text-[#0f172a] dark:text-[#f8fafc] leading-tight font-mono">
                    {selectedLink.sourceDeviceId} ⇄ {selectedLink.targetDeviceId}
                  </h3>
                  <p className="font-mono text-[11.5px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                    {selectedLink.linkId} ·{' '}
                    {formatLinkType(selectedLink.linkType, locale)}
                  </p>
                </div>
                {(() => {
                  const badge = getLinkStatusBadge(selectedLink.operStatus, locale)
                  return (
                    <span
                      className={`font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )
                })()}
              </div>

              {/* Properties Box */}
              <div className="border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg divide-y divide-[#f1f5f9] dark:divide-[#1e293b] text-[12.5px] overflow-hidden">
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    SOURCE
                  </span>
                  <span className="font-mono font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {selectedLink.sourceDeviceId} ({selectedLink.sourcePort})
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    TARGET
                  </span>
                  <span className="font-mono font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {selectedLink.targetDeviceId} ({selectedLink.targetPort})
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    CAPACITY
                  </span>
                  <span className="font-mono font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {formatCapacity(selectedLink.capacityGbps)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    RX POWER
                  </span>
                  {(() => {
                    const rx = formatRxPower(selectedLink.rxPowerDbm)
                    return (
                      <span
                        className={`font-mono font-bold flex items-center gap-1 ${
                          rx.isCritical
                            ? 'text-rose-600 dark:text-rose-400'
                            : rx.isWarning
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-[#0f172a] dark:text-[#f8fafc]'
                        }`}
                      >
                        {rx.formatted}
                        {(rx.isWarning || rx.isCritical) && (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )
                  })()}
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    TX POWER
                  </span>
                  <span className="font-mono font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {formatTxPower(selectedLink.txPowerDbm)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    UTILIZATION
                  </span>
                  {(() => {
                    const util = formatUtilization(selectedLink.utilizationPercent)
                    return (
                      <span
                        className={`font-mono font-bold ${
                          util.isCritical
                            ? 'text-rose-600 dark:text-rose-400'
                            : util.isWarning
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-[#0f172a] dark:text-[#f8fafc]'
                        }`}
                      >
                        {util.formatted}
                      </span>
                    )
                  })()}
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    IS BACKUP
                  </span>
                  <span className="font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {selectedLink.isBackup ? (isEn ? 'Yes' : 'Có') : isEn ? 'No' : 'Không'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() =>
                  onNavigateToTopology({
                    type: 'links',
                    id: selectedLink.linkId,
                    nodeId: selectedLink.sourceDeviceId,
                  })
                }
                className="w-full mt-2 py-2.5 px-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-[13px] rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isEn ? 'View in Topology →' : 'Xem trong topology →'}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </>
          )}

          {/* SERVICE INSPECTION */}
          {activeTab === 'services' && selectedService && (
            <>
              {/* Title row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-[17px] text-[#0f172a] dark:text-[#f8fafc] leading-tight">
                    {selectedService.name}
                  </h3>
                  <p className="text-[12.5px] text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                    {formatServiceType(selectedService.type, locale)} ·{' '}
                    {selectedService.region}
                  </p>
                </div>
                {(() => {
                  const badge = getServiceStatusBadge(selectedService.status, locale)
                  return (
                    <span
                      className={`font-mono text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )
                })()}
              </div>

              {/* Description */}
              {selectedService.description && (
                <p className="text-[12.5px] text-[#475569] dark:text-[#94a3b8] bg-[#f8fafc] dark:bg-[#0b0f19] p-3 rounded-lg border border-[#e2e8f0] dark:border-[#1e293b]">
                  {selectedService.description}
                </p>
              )}

              {/* Properties Box */}
              <div className="border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg divide-y divide-[#f1f5f9] dark:divide-[#1e293b] text-[12.5px] overflow-hidden">
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    SERVICE ID
                  </span>
                  <span className="font-mono font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {selectedService.id}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    SUBSCRIBERS
                  </span>
                  <span className="font-mono font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {formatSubscribers(selectedService.subscriberCount, locale)}{' '}
                    <span className="text-[11px] font-normal text-[#64748b] dark:text-[#94a3b8]">
                      {isEn ? 'subscribers' : 'thuê bao'}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3">
                  <span className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                    DEPENDENT DEVICES
                  </span>
                  <span className="font-mono font-semibold text-[#0f172a] dark:text-[#f8fafc]">
                    {'dependentDevices' in selectedService
                      ? selectedService.dependentDevices.length
                      : selectedService.dependentDeviceCount}{' '}
                    {isEn ? 'nodes' : 'thiết bị'}
                  </span>
                </div>
              </div>

              {/* Dependent Devices List */}
              {'dependentDevices' in selectedService &&
                selectedService.dependentDevices?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                      {isEn ? 'DEPENDENT NODES' : 'DANH SÁCH THIẾT BỊ PHỤ THUỘC'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedService.dependentDevices.map((dev) => (
                        <button
                          key={dev.id}
                          type="button"
                          onClick={() => onSelectDependentDevice?.(dev.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f1f5f9] dark:bg-[#1e293b] hover:bg-[#e2e8f0] dark:hover:bg-[#334155] rounded-md text-[11.5px] font-mono font-semibold text-[#0f172a] dark:text-[#f8fafc] border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                        >
                          <span>{dev.name}</span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              dev.status === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : dev.status === 'DEGRADED'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Service Impact Breakdown if provided */}
              {serviceImpact && (
                <div className="p-3 bg-[#f8fafc] dark:bg-[#0b0f19] border border-[#e2e8f0] dark:border-[#1e293b] rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono font-extrabold text-[#64748b] dark:text-[#94a3b8] uppercase">
                    <span>{isEn ? 'SERVICE IMPACT' : 'MỨC ĐỘ ẢNH HƯỞNG'}</span>
                    <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded">
                      <div className="font-mono font-bold text-[13px] text-emerald-700 dark:text-emerald-400">
                        {serviceImpact.activeDevices}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {isEn ? 'Active' : 'Hoạt động'}
                      </div>
                    </div>
                    <div className="p-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded">
                      <div className="font-mono font-bold text-[13px] text-amber-700 dark:text-amber-400">
                        {serviceImpact.degradedDevices}
                      </div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        {isEn ? 'Degraded' : 'Cảnh báo'}
                      </div>
                    </div>
                    <div className="p-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded">
                      <div className="font-mono font-bold text-[13px] text-rose-700 dark:text-rose-400">
                        {serviceImpact.outageDevices}
                      </div>
                      <div className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                        {isEn ? 'Outage' : 'Gián đoạn'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={() =>
                  onNavigateToTopology({
                    type: 'services',
                    id: selectedService.id,
                    nodeId:
                      'dependentDevices' in selectedService &&
                      selectedService.dependentDevices?.[0]?.id
                        ? selectedService.dependentDevices[0].id
                        : undefined,
                  })
                }
                className="w-full mt-2 py-2.5 px-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-[13px] rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isEn ? 'View in Topology →' : 'Xem trong topology →'}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </>
          )}

          {/* CORRELATED INCIDENT ALERT CARD */}
          {correlatedIncident && (
            <div className="mt-1 pt-3 border-t border-[#e2e8f0] dark:border-[#1e293b]">
              <div className="font-mono text-[10.5px] font-extrabold tracking-wider text-[#64748b] dark:text-[#94a3b8] uppercase mb-2">
                {isEn ? 'CORRELATED INCIDENT' : 'LIÊN QUAN SỰ CỐ'}
              </div>
              <div className="flex items-start gap-3 p-3 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg">
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-300 shrink-0">
                  {correlatedIncident.id}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold text-[#0f172a] dark:text-[#f8fafc] leading-snug line-clamp-2">
                    {correlatedIncident.title}
                  </div>
                  <div className="text-[11px] text-[#64748b] dark:text-[#94a3b8] mt-1 flex items-center gap-2 font-mono">
                    <span className="capitalize">{correlatedIncident.status.toLowerCase()}</span>
                    <span>·</span>
                    <span>{correlatedIncident.alarmCount} alarms</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
