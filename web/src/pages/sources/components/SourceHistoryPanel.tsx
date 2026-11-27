import type {
  ExternalSourceDetails,
  ExternalSourceSummary,
  SyncRunSummary,
} from '@/api/sources'
import { Button } from '@/components/ui/button'
import {
  formatStreamLatency,
  formatSyncRecordResult,
  formatSyncTimestamp,
  getSyncStatusBadge,
} from './sourceUtils'
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Radio } from 'lucide-react'

export interface SourceHistoryPanelProps {
  source: ExternalSourceSummary | ExternalSourceDetails | null
  history: SyncRunSummary[]
  page?: number
  totalPages?: number
  totalElements?: number
  isResyncing?: boolean
  isLoading?: boolean
  isLiveConnected?: boolean
  onResync?: () => void
  onPageChange?: (page: number) => void
  locale?: 'vi' | 'en'
}

export function SourceHistoryPanel({
  source,
  history,
  page = 0,
  totalPages = 0,
  totalElements = 0,
  isResyncing = false,
  isLoading = false,
  isLiveConnected = false,
  onResync,
  onPageChange,
  locale = 'vi',
}: SourceHistoryPanelProps) {
  const isEn = locale === 'en'
  const isMq = source?.type === 'MQ'

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between font-mono font-extrabold text-[11px] tracking-[0.14em] text-[#64748b] dark:text-[#94a3b8] px-4 py-3.5 border-b border-[#e2e8f0] dark:border-[#1e293b] select-none">
        <div className="flex items-center gap-2">
          <span>{isEn ? 'SYNC HISTORY' : 'LỊCH SỬ ĐỒNG BỘ'}</span>
          {!isMq && isLiveConnected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-[9.5px] font-bold tracking-[0.06em] text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {isEn ? 'LIVE' : 'TRỰC TIẾP'}
            </span>
          )}
        </div>
        {source && (
          <span className="font-mono font-bold text-[11px] text-[#334155] dark:text-[#cbd5e1] bg-[#f1f5f9] dark:bg-[#1e293b] rounded-full px-2.5 py-0.5 tracking-normal truncate max-w-[180px]">
            {source.name}
          </span>
        )}
      </div>

      {/* Active Re-sync Banner */}
      {isResyncing && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/60 text-[#1d4ed8] dark:text-blue-400 text-[12.5px] font-semibold animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>
            {isEn
              ? 'Resyncing from scratch in progress...'
              : 'Đang đồng bộ lại từ đầu · vui lòng đợi trong giây lát…'}
          </span>
        </div>
      )}

      {/* Message Queue Streaming Notice */}
      {isMq && (
        <div className="p-4 sm:p-5 text-[12.5px] text-[#64748b] dark:text-[#94a3b8] leading-relaxed flex items-start gap-3">
          <Radio className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="m-0">
              {isEn
                ? 'Message queue sources stream events continuously — no polling history is recorded.'
                : 'Nguồn message queue nhận sự kiện liên tục — không có lịch sử poll.'}
            </p>
            <p className="mt-1.5 m-0 font-mono text-[11.5px] text-[#0f172a] dark:text-[#f8fafc]">
              {isEn ? 'Stream latency: ' : 'Độ trễ luồng: '}
              <span className="font-bold text-[#10b981]">
                {formatStreamLatency(source?.streamLatencyMs, locale)}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* REST Polling History List */}
      {!isMq && (
        <>
          {isLoading ? (
            <div className="divide-y divide-[#e2e8f0] dark:divide-[#1e293b] animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded font-mono" />
                  <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-4 w-36 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[#94a3b8] dark:text-[#64748b]">
              {isEn ? 'No sync history records found.' : 'Chưa có bản ghi lịch sử đồng bộ.'}
            </div>
          ) : (
            <div className="divide-y divide-[#e2e8f0] dark:divide-[#1e293b]">
              {history.map((record) => {
                const timeStr = formatSyncTimestamp(
                  record.updatedAt ?? record.finishedAt ?? record.startedAt
                )
                const badge = getSyncStatusBadge(record.status, locale)
                const resultText = formatSyncRecordResult(record, locale)

                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 px-4 py-2.5 text-[12.5px] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b]/40 transition-colors"
                  >
                    <span className="font-mono font-bold text-[12px] text-[#334155] dark:text-[#cbd5e1] shrink-0 w-16">
                      {timeStr}
                    </span>

                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.04em] ${badge.className}`}
                    >
                      {badge.label}
                    </span>

                    <span className="text-[#64748b] dark:text-[#94a3b8] truncate flex-1 text-[12px]">
                      {resultText}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {!isLoading && onPageChange && totalPages > 1 && (
            <div className="border-t border-[#e2e8f0] dark:border-[#1e293b] px-4 py-2.5 flex items-center justify-between">
              <span className="text-[11.5px] text-[#64748b] dark:text-[#94a3b8]">
                {isEn ? 'Page' : 'Trang'} {page + 1} / {totalPages}
                {totalElements > 0 && (
                  <>
                    {' '}
                    · {totalElements.toLocaleString(isEn ? 'en-US' : 'vi-VN')}{' '}
                    {isEn ? 'records' : 'bản ghi'}
                  </>
                )}
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

          {/* Action Footer: Resync from scratch */}
          <div className="p-3 border-t border-[#e2e8f0] dark:border-[#1e293b] bg-[#fafafa] dark:bg-[#0b0f19]/40 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isResyncing || isLoading || !source}
              onClick={onResync}
              className="h-8 px-3 text-xs font-bold text-[#334155] dark:text-[#cbd5e1] bg-white dark:bg-[#1e293b] border-[#cbd5e1] dark:border-[#334155] hover:bg-[#f1f5f9] dark:hover:bg-[#334155] cursor-pointer transition-colors flex items-center gap-1.5"
            >
              {isResyncing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEn ? 'Resyncing…' : 'Đang đồng bộ…'}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Resync from scratch' : 'Đồng bộ lại từ đầu'}</span>
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
