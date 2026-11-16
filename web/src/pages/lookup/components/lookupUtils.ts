import type {
  DeviceLayer,
  DeviceStatus,
  DeviceSummary,
  LinkSummary,
  LinkType,
} from '@/api/topology'
import type {
  NetworkServiceSummary,
  ServiceStatus,
  ServiceType,
} from '@/api/services'

export type LookupTab = 'devices' | 'links' | 'services'

export interface StatusChipConfig {
  label: string
  className: string
  variant: 'ok' | 'warn' | 'bad' | 'muted'
}

/**
 * Returns badge styling and localized label for DeviceStatus.
 */
export function getDeviceStatusBadge(
  status: DeviceStatus | string,
  locale: 'vi' | 'en' = 'vi'
): StatusChipConfig {
  const isEn = locale === 'en'
  switch (status) {
    case 'ACTIVE':
      return {
        label: isEn ? 'ACTIVE' : 'HOẠT ĐỘNG',
        className:
          'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
        variant: 'ok',
      }
    case 'DEGRADED':
      return {
        label: isEn ? 'DEGRADED' : 'CẢNH BÁO',
        className:
          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
        variant: 'warn',
      }
    case 'CRITICAL':
      return {
        label: isEn ? 'CRITICAL' : 'SỰ CỐ',
        className:
          'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
        variant: 'bad',
      }
    case 'OFFLINE':
    default:
      return {
        label: isEn ? 'OFFLINE' : 'NGOẠI TUYẾN',
        className:
          'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/60',
        variant: 'muted',
      }
  }
}

/**
 * Returns badge styling and localized label for link operational status (UP, DEGRADED, DOWN).
 */
export function getLinkStatusBadge(
  status: string,
  locale: 'vi' | 'en' = 'vi'
): StatusChipConfig {
  const isEn = locale === 'en'
  const normalized = (status || '').toUpperCase()
  switch (normalized) {
    case 'UP':
    case 'ACTIVE':
      return {
        label: isEn ? 'UP' : 'HOẠT ĐỘNG',
        className:
          'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
        variant: 'ok',
      }
    case 'DEGRADED':
    case 'WARNING':
      return {
        label: isEn ? 'DEGRADED' : 'CẢNH BÁO',
        className:
          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
        variant: 'warn',
      }
    case 'DOWN':
    case 'CRITICAL':
      return {
        label: isEn ? 'DOWN' : 'MẤT KẾT NỐI',
        className:
          'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
        variant: 'bad',
      }
    default:
      return {
        label: status || (isEn ? 'UNKNOWN' : 'KHÔNG XÁC ĐỊNH'),
        className:
          'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/60',
        variant: 'muted',
      }
  }
}

/**
 * Returns badge styling and localized label for ServiceStatus.
 */
export function getServiceStatusBadge(
  status: ServiceStatus | string,
  locale: 'vi' | 'en' = 'vi'
): StatusChipConfig {
  const isEn = locale === 'en'
  switch (status) {
    case 'OPERATIONAL':
      return {
        label: isEn ? 'OPERATIONAL' : 'HOẠT ĐỘNG',
        className:
          'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
        variant: 'ok',
      }
    case 'DEGRADED':
      return {
        label: isEn ? 'DEGRADED' : 'CẢNH BÁO',
        className:
          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
        variant: 'warn',
      }
    case 'OUTAGE':
      return {
        label: isEn ? 'OUTAGE' : 'GIÁN ĐOẠN',
        className:
          'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
        variant: 'bad',
      }
    default:
      return {
        label: status || (isEn ? 'UNKNOWN' : 'KHÔNG XÁC ĐỊNH'),
        className:
          'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/60',
        variant: 'muted',
      }
  }
}

/**
 * Formats Device Layer with localized title and detailed role description.
 */
export function formatDeviceLayer(
  layer: DeviceLayer,
  locale: 'vi' | 'en' = 'vi'
): { name: string; description: string } {
  const isEn = locale === 'en'
  switch (layer) {
    case 'CORE':
      return {
        name: isEn ? 'Core' : 'Lõi',
        description: isEn ? 'Core Router' : 'Router lõi trung tâm',
      }
    case 'AGGREGATION':
      return {
        name: isEn ? 'Aggregation' : 'Tổng hợp',
        description: isEn ? 'Aggregation Switch' : 'Switch tổng hợp',
      }
    case 'ACCESS':
      return {
        name: isEn ? 'Access' : 'Truy nhập',
        description: isEn ? 'Access Router' : 'Router trạm',
      }
    case 'PEER':
      return {
        name: isEn ? 'Peering' : 'Ngang hàng',
        description: isEn ? 'Peering Gateway' : 'Gateway kết nối đối tác',
      }
    case 'IGW':
      return {
        name: isEn ? 'IGW' : 'Cổng Quốc tế',
        description: isEn ? 'International Gateway' : 'Cổng Internet quốc tế',
      }
    case 'EXCHANGE':
      return {
        name: isEn ? 'Exchange' : 'Trung chuyển',
        description: isEn ? 'Internet Exchange Point' : 'Điểm trung chuyển lưu lượng',
      }
    default:
      return {
        name: layer,
        description: layer,
      }
  }
}

/**
 * Formats Service Type with human-readable name.
 */
export function formatServiceType(
  type: ServiceType | string,
  locale: 'vi' | 'en' = 'vi'
): string {
  const isEn = locale === 'en'
  switch (type) {
    case 'INTERNET_TRANSIT':
      return isEn ? 'Internet Transit' : 'Internet Transit'
    case 'VPN_MPLS':
      return isEn ? 'MPLS VPN' : 'VPN / MPLS'
    case 'VOIP':
      return isEn ? 'VoIP Service' : 'Dịch vụ thoại IP'
    case 'IPTV':
      return isEn ? 'IPTV / OTT' : 'Truyền hình IPTV'
    case 'CLOUD_CONNECT':
      return isEn ? 'Cloud Connect' : 'Kết nối Cloud'
    case 'DATACENTER':
      return isEn ? 'Data Center Interconnect' : 'Kết nối Data Center'
    case 'DNS':
      return isEn ? 'Core DNS' : 'Hệ thống DNS'
    default:
      return type
  }
}

/**
 * Formats Link Type with human-readable name.
 */
export function formatLinkType(
  type: LinkType | string,
  locale: 'vi' | 'en' = 'vi'
): string {
  const isEn = locale === 'en'
  switch (type) {
    case 'PHYSICAL_FIBER':
      return isEn ? 'Physical Fiber' : 'Cáp quang vật lý'
    case 'LOGICAL_IP':
      return isEn ? 'Logical IP' : 'Tuyến IP Logic'
    default:
      return type
  }
}

/**
 * Formats optical Rx Power in dBm and determines health threshold.
 * Warning at < -20.0 dBm; Critical at < -24.0 dBm.
 */
export function formatRxPower(rxPowerDbm?: number | null): {
  formatted: string
  isWarning: boolean
  isCritical: boolean
} {
  if (rxPowerDbm === null || rxPowerDbm === undefined) {
    return { formatted: '-- dBm', isWarning: false, isCritical: false }
  }
  const isCritical = rxPowerDbm <= -24.0
  const isWarning = !isCritical && rxPowerDbm <= -20.0
  const sign = rxPowerDbm > 0 ? '+' : ''
  return {
    formatted: `${sign}${rxPowerDbm.toFixed(1)} dBm`,
    isWarning,
    isCritical,
  }
}

/**
 * Formats optical Tx Power in dBm.
 */
export function formatTxPower(txPowerDbm?: number | null): string {
  if (txPowerDbm === null || txPowerDbm === undefined) {
    return '-- dBm'
  }
  const sign = txPowerDbm > 0 ? '+' : ''
  return `${sign}${txPowerDbm.toFixed(1)} dBm`
}

/**
 * Formats link bandwidth capacity in Gbps.
 */
export function formatCapacity(capacityGbps?: number | null): string {
  if (capacityGbps === null || capacityGbps === undefined) {
    return '-- Gbps'
  }
  return `${capacityGbps} Gbps`
}

/**
 * Formats bandwidth utilization percentage and determines health warning.
 */
export function formatUtilization(percent?: number | null): {
  formatted: string
  isWarning: boolean
  isCritical: boolean
} {
  if (percent === null || percent === undefined) {
    return { formatted: '--%', isWarning: false, isCritical: false }
  }
  const isCritical = percent >= 85
  const isWarning = !isCritical && percent >= 70
  return {
    formatted: `${percent.toFixed(1)}%`,
    isWarning,
    isCritical,
  }
}

/**
 * Formats subscriber count with thousands separator.
 */
export function formatSubscribers(count?: number | null, locale: 'vi' | 'en' = 'vi'): string {
  if (count === null || count === undefined) {
    return '0'
  }
  return count.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')
}

/**
 * Filters device items by query, layer, region, and status.
 */
export function filterDevices(
  devices: DeviceSummary[],
  query: string,
  layerFilter: string,
  regionFilter: string,
  statusFilter: string
): DeviceSummary[] {
  const q = query.trim().toLowerCase()
  return devices.filter((d) => {
    if (layerFilter && layerFilter !== 'ALL' && d.layer !== layerFilter) return false
    if (regionFilter && regionFilter !== 'ALL' && d.region !== regionFilter) return false
    if (statusFilter && statusFilter !== 'ALL' && d.status !== statusFilter) return false

    if (!q) return true
    return (
      d.name.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.ipAddress.toLowerCase().includes(q) ||
      d.model.toLowerCase().includes(q) ||
      d.site.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q)
    )
  })
}

/**
 * Filters link items by query, type, and operational status.
 */
export function filterLinks(
  links: LinkSummary[],
  query: string,
  typeFilter: string,
  statusFilter: string
): LinkSummary[] {
  const q = query.trim().toLowerCase()
  return links.filter((l) => {
    if (typeFilter && typeFilter !== 'ALL' && l.linkType !== typeFilter) return false
    if (statusFilter && statusFilter !== 'ALL') {
      const oper = (l.operStatus || '').toUpperCase()
      if (oper !== statusFilter) return false
    }

    if (!q) return true
    return (
      l.linkId.toLowerCase().includes(q) ||
      l.sourceDeviceId.toLowerCase().includes(q) ||
      l.targetDeviceId.toLowerCase().includes(q) ||
      l.sourcePort.toLowerCase().includes(q) ||
      l.targetPort.toLowerCase().includes(q)
    )
  })
}

/**
 * Filters service items by query, type, region, and status.
 */
export function filterServices(
  services: NetworkServiceSummary[],
  query: string,
  typeFilter: string,
  regionFilter: string,
  statusFilter: string
): NetworkServiceSummary[] {
  const q = query.trim().toLowerCase()
  return services.filter((s) => {
    if (typeFilter && typeFilter !== 'ALL' && s.type !== typeFilter) return false
    if (regionFilter && regionFilter !== 'ALL' && s.region !== regionFilter) return false
    if (statusFilter && statusFilter !== 'ALL' && s.status !== statusFilter) return false

    if (!q) return true
    return (
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      s.region.toLowerCase().includes(q)
    )
  })
}
