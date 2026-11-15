import type { DocumentSource, DocType, IndexingStatus } from '@/api/documents'

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const val = bytes / Math.pow(k, i)
  return `${val.toFixed(val >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`
}

export function formatRelativeTime(isoString?: string, locale: 'vi' | 'en' = 'vi'): string {
  if (!isoString) return ''
  const isEn = locale === 'en'
  const now = Date.now()
  const date = new Date(isoString).getTime()
  const diffSec = Math.max(0, Math.floor((now - date) / 1000))

  if (diffSec < 60) {
    return isEn ? 'just now' : 'vừa xong'
  }
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) {
    return isEn ? `${diffMin}m ago` : `${diffMin} phút trước`
  }
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) {
    return isEn ? `${diffHours}h ago` : `${diffHours} giờ trước`
  }
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) {
    return isEn ? 'yesterday' : 'hôm qua'
  }
  if (diffDays < 7) {
    return isEn ? `${diffDays} days ago` : `${diffDays} ngày trước`
  }
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) {
    return isEn ? `${diffWeeks}w ago` : `${diffWeeks} tuần trước`
  }
  return new Date(isoString).toLocaleDateString(isEn ? 'en-US' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getSourceLabel(source: DocumentSource, locale: 'vi' | 'en' = 'vi'): string {
  const isEn = locale === 'en'
  switch (source) {
    case 'MANUAL':
      return isEn ? 'Direct Upload' : 'Tải lên trực tiếp'
    case 'INTERNAL_WIKI':
      return isEn ? 'Internal Wiki' : 'Wiki nội bộ'
    case 'CONFLUENCE':
      return 'Confluence'
    case 'OPERATIONS_DRIVE':
      return isEn ? 'Operations Drive' : 'Drive vận hành'
    default:
      return source
  }
}

export function getDocTypeLabel(type: DocType, locale: 'vi' | 'en' = 'vi'): string {
  const isEn = locale === 'en'
  switch (type) {
    case 'OPERATION_RUNBOOK':
      return isEn ? 'Runbook' : 'Quy trình'
    case 'VENDOR_SPECIFICATION':
      return isEn ? 'Specification' : 'Tài liệu hãng'
    case 'POST_MORTEM_REPORT':
      return isEn ? 'Post-mortem' : 'Báo cáo sự cố'
    default:
      return type
  }
}

export interface StatusChipConfig {
  label: string
  className: string
}

export function getStatusChipConfig(
  status: IndexingStatus,
  statusReason?: string | null,
  locale: 'vi' | 'en' = 'vi'
): StatusChipConfig {
  const isEn = locale === 'en'

  switch (status) {
    case 'READY':
      return {
        label: isEn ? 'READY' : 'SẴN SÀNG',
        className: 'bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]',
      }
    case 'INDEXING':
      return {
        label: isEn ? 'INDEXING' : 'ĐANG LẬP CHỈ MỤC',
        className: 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]',
      }
    case 'FAILED':
      return {
        label: statusReason
          ? isEn
            ? `FAILED · ${statusReason}`
            : `LỖI · ${statusReason}`
          : isEn
          ? 'FAILED'
          : 'LỖI',
        className: 'bg-[#fef2f2] text-[#dc2626] border border-[#fca5a5]',
      }
    default:
      return {
        label: status,
        className: 'bg-slate-100 text-slate-700 border border-slate-300',
      }
  }
}
