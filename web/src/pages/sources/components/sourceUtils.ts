import type {
  ExternalSourceSummary,
  SyncRunSummary,
  SyncStatus,
} from '@/api/sources'

export interface StatusChipConfig {
  label: string
  className: string
  variant: 'ok' | 'warn' | 'bad' | 'muted'
}

/**
 * Returns badge styling and localized label for an ExternalSourceSummary.
 */
export function getSourceStatusChip(
  source: ExternalSourceSummary,
  locale: 'vi' | 'en' = 'vi'
): StatusChipConfig {
  const isEn = locale === 'en'

  if (source.type === 'MQ') {
    if (source.status === 'ERROR') {
      return {
        label: isEn ? 'STREAM ERROR' : 'LỖI LUỒNG',
        className:
          'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
        variant: 'bad',
      }
    }
    if (source.status === 'PENDING_FIRST_SYNC') {
      return {
        label: isEn ? 'CONNECTING' : 'CHỜ KẾT NỐI',
        className:
          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
        variant: 'warn',
      }
    }
    return {
      label: isEn ? 'CONTINUOUS STREAM' : 'LUỒNG LIÊN TỤC',
      className:
        'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
      variant: 'ok',
    }
  }

  // REST Source
  if (source.status === 'ERROR') {
    const isTokenExpired = source.lastSyncMessage?.toLowerCase().includes('token')
    return {
      label: isTokenExpired
        ? isEn
          ? 'ERR · TOKEN EXPIRED'
          : 'LỖI · TOKEN HẾT HẠN'
        : isEn
        ? 'SYNC FAILED'
        : 'LỖI ĐỒNG BỘ',
      className:
        'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
      variant: 'bad',
    }
  }

  if (source.status === 'PENDING_FIRST_SYNC') {
    return {
      label: isEn ? 'PENDING SYNC' : 'CHỜ ĐỒNG BỘ',
      className:
        'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
      variant: 'warn',
    }
  }

  // ACTIVE REST Source
  if (source.lastSyncAt) {
    const timeStr = formatSyncTime(source.lastSyncAt)
    return {
      label: isEn ? `SYNCED ${timeStr}` : `ĐỒNG BỘ ${timeStr}`,
      className:
        'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
      variant: 'ok',
    }
  }

  return {
    label: isEn ? 'ACTIVE' : 'HOẠT ĐỘNG',
    className:
      'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
    variant: 'ok',
  }
}

/**
 * Returns subtitle describing connection protocol and interval/topic.
 */
export function getSourceSubtitle(
  source: ExternalSourceSummary,
  locale: 'vi' | 'en' = 'vi'
): string {
  const isEn = locale === 'en'

  if (source.type === 'MQ') {
    const topic = source.topic || 'n/a'
    return `Message queue · topic ${topic}`
  }

  const interval = source.pollIntervalSeconds ?? 60
  if (isEn) {
    return interval >= 60 && interval % 60 === 0
      ? `REST API · polling every ${interval / 60}m`
      : `REST API · polling every ${interval}s`
  }

  return interval >= 60 && interval % 60 === 0
    ? `REST API · polling mỗi ${interval / 60} phút`
    : `REST API · polling mỗi ${interval} giây`
}

/**
 * Returns badge styling and localized label for a SyncStatus.
 */
export function getSyncStatusBadge(
  status: SyncStatus | string,
  locale: 'vi' | 'en' = 'vi'
): StatusChipConfig {
  const isEn = locale === 'en'
  const normalized = (status || '').toUpperCase()

  switch (normalized) {
    case 'SUCCESS':
      return {
        label: isEn ? 'SUCCESS' : 'THÀNH CÔNG',
        className:
          'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
        variant: 'ok',
      }
    case 'FAILED':
      return {
        label: isEn ? 'FAILED' : 'THẤT BẠI',
        className:
          'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
        variant: 'bad',
      }
    case 'RUNNING':
    default:
      return {
        label: isEn ? 'RUNNING' : 'ĐANG CHẠY',
        className:
          'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
        variant: 'warn',
      }
  }
}

/**
 * Formats ISO string into HH:mm format.
 */
export function formatSyncTime(isoString?: string): string {
  if (!isoString) return '--:--'
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return '--:--'
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return '--:--'
  }
}

/**
 * Formats ISO string into full date/time format.
 */
export function formatFullSyncTime(
  isoString?: string,
  _locale: 'vi' | 'en' = 'vi'
): string {
  if (!isoString) return '--:--'
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return '--:--'
    const time = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${time} ${day}/${month}/${year}`
  } catch {
    return '--:--'
  }
}

/**
 * Formats sync run result metric or failure message.
 */
export function formatSyncRecordResult(
  record: SyncRunSummary,
  locale: 'vi' | 'en' = 'vi'
): string {
  const isEn = locale === 'en'

  if (record.status === 'SUCCESS') {
    const count = record.recordsFetched.toLocaleString(isEn ? 'en-US' : 'vi-VN')
    const failed = record.recordsFailed
    return isEn
      ? `${count} records · ${failed} errors`
      : `${count} bản ghi · ${failed} lỗi`
  }

  if (record.status === 'FAILED') {
    return record.message || (isEn ? 'Sync failed' : 'Đồng bộ thất bại')
  }

  return isEn ? 'Fetching records...' : 'Đang lấy bản ghi...'
}

/**
 * Formats stream latency for Message Queue info block.
 */
export function formatStreamLatency(
  latencyMs?: number,
  locale: 'vi' | 'en' = 'vi'
): string {
  const isEn = locale === 'en'
  if (!latencyMs || latencyMs <= 0) {
    return isEn ? 'under 2 seconds' : 'dưới 2 giây'
  }
  if (latencyMs < 1000) {
    return `${latencyMs}ms`
  }
  const seconds = (latencyMs / 1000).toFixed(1)
  return isEn ? `${seconds}s` : `${seconds} giây`
}
