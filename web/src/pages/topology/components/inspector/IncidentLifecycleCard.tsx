import React, { useState } from 'react'
import type { IncidentStatus } from '@/api/incidents'
import { cn } from '@/lib/utils'
import { CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react'

export interface IncidentLifecycleCardProps {
  incidentId: string
  status?: IncidentStatus | null
  isUpdating?: boolean
  onUpdateStatus: (status: IncidentStatus, resolutionNote?: string) => Promise<void> | void
  locale?: 'vi' | 'en'
}

export const IncidentLifecycleCard: React.FC<IncidentLifecycleCardProps> = ({
  incidentId,
  status = 'INVESTIGATING',
  isUpdating = false,
  onUpdateStatus,
  locale = 'vi',
}) => {
  const isEn = locale === 'en'
  const [pendingTargetStatus, setPendingTargetStatus] = useState<'MITIGATED' | 'RESOLVED' | null>(
    null
  )
  const [resolutionNote, setResolutionNote] = useState('')

  const normalized = (status || 'INVESTIGATING') as IncidentStatus

  const handleConfirmWithNote = async () => {
    if (!pendingTargetStatus) return
    await onUpdateStatus(pendingTargetStatus, resolutionNote.trim() || undefined)
    setPendingTargetStatus(null)
    setResolutionNote('')
  }

  return (
    <div
      data-testid="incident-lifecycle-card"
      data-incident-status={normalized}
      className="mb-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b111e] border border-slate-200 dark:border-slate-800 space-y-2 shrink-0"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase">
          {isEn ? 'INCIDENT SESSION' : 'PHIÊN ĐIỀU TRA'} · {incidentId}
        </span>
        <span
          data-testid="incident-lifecycle-status-badge"
          className={cn(
            'px-1.5 py-0.5 rounded font-mono text-[9px] font-extrabold uppercase border',
            normalized === 'RESOLVED'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/35'
              : normalized === 'MITIGATED'
                ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/35'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35'
          )}
        >
          {normalized}
        </span>
      </div>

      {pendingTargetStatus ? (
        <div className="space-y-1.5 pt-0.5">
          <div className="font-mono text-[9.5px] font-bold text-slate-600 dark:text-slate-300">
            {pendingTargetStatus === 'MITIGATED'
              ? isEn
                ? 'Mitigation note (optional):'
                : 'Ghi chú giảm thiểu (tuỳ chọn):'
              : isEn
                ? 'Resolution note:'
                : 'Ghi chú đóng sự cố:'}
          </div>
          <textarea
            rows={2}
            data-testid="incident-resolution-note-input"
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder={
              isEn
                ? 'Summarize actions taken & verification results...'
                : 'Mô tả thao tác khắc phục & kết quả kiểm tra...'
            }
            className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-[10.5px] text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-1 focus:ring-sky-500/40 resize-none"
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => {
                setPendingTargetStatus(null)
                setResolutionNote('')
              }}
              className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Hủy'}
            </button>
            <button
              type="button"
              disabled={isUpdating}
              data-testid="incident-status-confirm-btn"
              onClick={handleConfirmWithNote}
              className={cn(
                'px-2.5 py-1 rounded text-white text-[10px] font-mono font-bold transition-colors cursor-pointer disabled:opacity-50',
                pendingTargetStatus === 'RESOLVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-sky-600 hover:bg-sky-700'
              )}
            >
              {pendingTargetStatus === 'RESOLVED'
                ? isEn
                  ? 'Confirm Resolve'
                  : 'Xác nhận đóng'
                : isEn
                  ? 'Confirm Mitigate'
                  : 'Xác nhận giảm thiểu'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 flex-wrap">
          {(normalized === 'OPEN' || normalized === 'PRIORITIZED') && (
            <button
              type="button"
              disabled={isUpdating}
              data-testid="incident-action-investigate"
              onClick={() => onUpdateStatus('INVESTIGATING')}
              className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isEn ? 'Investigate' : 'Điều tra'}
            </button>
          )}

          {normalized !== 'MITIGATED' && normalized !== 'RESOLVED' && (
            <button
              type="button"
              disabled={isUpdating}
              data-testid="incident-action-mitigate"
              onClick={() => setPendingTargetStatus('MITIGATED')}
              className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-mono text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{isEn ? 'Mitigate' : 'Giảm thiểu'}</span>
            </button>
          )}

          {normalized !== 'RESOLVED' ? (
            <button
              type="button"
              disabled={isUpdating}
              data-testid="incident-action-resolve"
              onClick={() => setPendingTargetStatus('RESOLVED')}
              className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{isEn ? 'Resolve' : 'Đóng sự cố'}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isUpdating}
              data-testid="incident-action-reopen"
              onClick={() => onUpdateStatus('INVESTIGATING')}
              className="w-full inline-flex items-center justify-center gap-1 py-1 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isEn ? 'Reopen Investigation' : 'Mở lại điều tra'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
