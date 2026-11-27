import React, { useMemo, useState } from 'react'
import type {
  HypothesisDetails,
  HypothesisSummary,
  UpdateHypothesisStatusPayload,
} from '@/api/hypotheses'
import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  RotateCcw,
  Sparkles,
  Terminal,
  XCircle,
} from 'lucide-react'

export interface HypothesisTabProps {
  incidentId?: string | null
  hypotheses: HypothesisSummary[]
  expandedHypothesisId?: number | null
  expandedDetails?: HypothesisDetails | null
  detailsById?: Record<number, HypothesisDetails>
  isLoading?: boolean
  isLoadingDetails?: boolean
  isUpdatingStatus?: boolean
  onToggleExpand: (hypothesis: HypothesisSummary) => void
  onUpdateStatus: (
    hypothesisId: number,
    payload: UpdateHypothesisStatusPayload
  ) => Promise<void> | void
  locale?: 'vi' | 'en'
  className?: string
}

function getScoreBadgeClass(score: number): string {
  if (score >= 80) {
    return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
  }
  if (score >= 55) {
    return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
  }
  return 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300/60 dark:border-slate-700'
}

export const HypothesisTab: React.FC<HypothesisTabProps> = ({
  incidentId,
  hypotheses,
  expandedHypothesisId = null,
  expandedDetails = null,
  detailsById = {},
  isLoading = false,
  isLoadingDetails = false,
  isUpdatingStatus = false,
  onToggleExpand,
  onUpdateStatus,
  locale = 'vi',
  className,
}) => {
  const isEn = locale === 'en'
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null)

  const { activeHypotheses, rejectedHypotheses } = useMemo(() => {
    const sorted = [...hypotheses].sort((a, b) => a.rank - b.rank)
    return {
      activeHypotheses: sorted.filter((h) => h.status !== 'REJECTED'),
      rejectedHypotheses: sorted.filter((h) => h.status === 'REJECTED'),
    }
  }, [hypotheses])

  const handleCopyCommand = (cmd: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(cmd).catch(() => {})
    }
    setCopiedCmd(cmd)
    window.setTimeout(() => {
      setCopiedCmd((prev) => (prev === cmd ? null : prev))
    }, 1500)
  }

  const handleOpenRejectForm = (id: number) => {
    setRejectingId(id)
    setRejectReason('')
  }

  const handleCancelReject = () => {
    setRejectingId(null)
    setRejectReason('')
  }

  const handleSubmitReject = async (id: number) => {
    const trimmed = rejectReason.trim()
    if (!trimmed) return
    await onUpdateStatus(id, { status: 'REJECTED', reason: trimmed })
    setRejectingId(null)
    setRejectReason('')
  }

  const renderCard = (hypothesis: HypothesisSummary, isRejectedSection: boolean) => {
    const isExpanded = expandedHypothesisId === hypothesis.id
    const isConfirmed = hypothesis.status === 'CONFIRMED'
    const isRejecting = rejectingId === hypothesis.id
    const details =
      (expandedDetails?.id === hypothesis.id ? expandedDetails : null) ??
      detailsById[hypothesis.id] ??
      null
    const rejectionReasonText = details?.rejectionReason
    const cliCommands = [details?.cliCommand || hypothesis.cliCommand, details?.verificationCmd].filter(
      (cmd, idx, arr): cmd is string => Boolean(cmd) && arr.indexOf(cmd) === idx
    )

    return (
      <div
        key={hypothesis.id}
        data-testid={`hypothesis-card-${hypothesis.id}`}
        data-status={hypothesis.status}
        className={cn(
          'rounded-lg border transition-all duration-150 overflow-hidden',
          isRejectedSection
            ? 'bg-slate-50/70 dark:bg-slate-900/35 border-slate-200/80 dark:border-slate-800/80 opacity-85'
            : isConfirmed
              ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/45 shadow-xs'
              : isExpanded
                ? 'bg-sky-500/5 dark:bg-sky-500/10 border-sky-500/45 shadow-xs'
                : 'bg-slate-50/90 dark:bg-slate-900/55 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        )}
      >
        {/* Micro-card Header (Click to expand accordion & focus target nodes on canvas) */}
        <button
          type="button"
          data-testid={`hypothesis-toggle-${hypothesis.id}`}
          aria-expanded={isExpanded}
          onClick={() => onToggleExpand(hypothesis)}
          className="w-full text-left p-2.5 flex flex-col gap-1.5 cursor-pointer outline-none"
        >
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-[9px] font-extrabold text-slate-700 dark:text-slate-200">
                #{hypothesis.rank}
              </span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded border font-mono text-[9.5px] font-bold tabular-nums',
                  getScoreBadgeClass(hypothesis.matchScore)
                )}
              >
                {hypothesis.matchScore}%
              </span>
              {isConfirmed && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-mono text-[8.5px] font-extrabold">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {isEn ? 'CONFIRMED' : 'ĐÃ XÁC NHẬN'}
                </span>
              )}
            </div>

            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
          </div>

          <div
            className={cn(
              'text-[11.5px] font-bold leading-snug text-slate-800 dark:text-slate-100',
              isRejectedSection && 'line-through text-slate-500 dark:text-slate-400'
            )}
          >
            {hypothesis.shortTitle || hypothesis.title}
          </div>

          <div className="flex items-center justify-between gap-1.5">
            <span className="font-mono text-[9.5px] font-semibold text-sky-600 dark:text-sky-400 truncate">
              {hypothesis.targetId}
            </span>
            <span className="font-mono text-[8.5px] uppercase text-slate-400 dark:text-slate-500 shrink-0">
              {hypothesis.targetType}
            </span>
          </div>

          {isRejectedSection && rejectionReasonText && (
            <div
              data-testid={`hypothesis-rejection-reason-${hypothesis.id}`}
              className="mt-0.5 px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-700 dark:text-rose-300 leading-snug"
            >
              <strong>{isEn ? 'Reason:' : 'Lý do:'}</strong> {rejectionReasonText}
            </div>
          )}
        </button>

        {/* Accordion Body */}
        {isExpanded && (
          <div
            data-testid={`hypothesis-details-${hypothesis.id}`}
            className="px-2.5 pb-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-800/80 space-y-2.5 text-[11px]"
          >
            {isLoadingDetails && !details ? (
              <div className="space-y-1.5 py-1">
                <div className="h-2.5 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-2.5 w-5/6 rounded bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
                <div className="h-2.5 w-2/3 rounded bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
              </div>
            ) : (
              <>
                {details?.title && details.title !== hypothesis.shortTitle && (
                  <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                    {details.title}
                  </div>
                )}

                {/* Confidence Rationale */}
                {details?.confidenceRationale && (
                  <div className="p-2 rounded bg-white/80 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                    <div className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                      {isEn ? 'AI RATIONALE' : 'PHÂN TÍCH AI'}
                    </div>
                    {details.confidenceRationale}
                  </div>
                )}

                {/* Supporting Evidence */}
                {details?.evidence && details.evidence.length > 0 && (
                  <div className="space-y-1">
                    <div className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {isEn ? 'SUPPORTING EVIDENCE' : 'BẰNG CHỨNG ỦNG HỘ'}
                    </div>
                    <ul className="space-y-1">
                      {details.evidence.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1.5 text-[10.5px] text-slate-700 dark:text-slate-300 leading-snug"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contradicting Evidence */}
                {details?.contradictingEvidence && details.contradictingEvidence.length > 0 && (
                  <div className="space-y-1">
                    <div className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {isEn ? 'CONTRADICTING EVIDENCE' : 'BẰNG CHỨNG PHẢN BÁC'}
                    </div>
                    <ul className="space-y-1">
                      {details.contradictingEvidence.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-300 leading-snug"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CLI / Verification Commands */}
                {cliCommands.length > 0 && (
                  <div className="space-y-1">
                    <div className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Terminal className="w-2.5 h-2.5" />
                      {isEn ? 'VERIFICATION CLI' : 'LỆNH CLI KIỂM CHỨNG'}
                    </div>
                    <div className="space-y-1">
                      {cliCommands.map((cmd) => (
                        <div
                          key={cmd}
                          className="flex items-center justify-between gap-1.5 px-2 py-1 rounded bg-slate-900 dark:bg-slate-950 text-emerald-300 font-mono text-[9.5px] border border-slate-800"
                        >
                          <span className="truncate select-text" title={cmd}>
                            {cmd}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCommand(cmd)}
                            title={isEn ? 'Copy command' : 'Sao chép lệnh'}
                            className="shrink-0 p-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedCmd === cmd ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm / Reject / Reopen Controls */}
                <div className="pt-1.5 border-t border-slate-200/70 dark:border-slate-800/80">
                  {hypothesis.status === 'UNDER_CONSIDERATION' ? (
                    isRejecting ? (
                      <div className="space-y-1.5">
                        <textarea
                          rows={2}
                          data-testid={`hypothesis-reject-reason-input-${hypothesis.id}`}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder={
                            isEn
                              ? 'Enter reason for rejecting this hypothesis...'
                              : 'Nhập lý do bác bỏ giả thuyết...'
                          }
                          className="w-full rounded border border-rose-500/40 bg-white dark:bg-slate-950 px-2 py-1 text-[10.5px] text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-1 focus:ring-rose-500/40 resize-none"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={handleCancelReject}
                            disabled={isUpdatingStatus}
                            className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            {isEn ? 'Cancel' : 'Hủy'}
                          </button>
                          <button
                            type="button"
                            data-testid={`hypothesis-reject-submit-${hypothesis.id}`}
                            onClick={() => handleSubmitReject(hypothesis.id)}
                            disabled={isUpdatingStatus || !rejectReason.trim()}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-[10px] font-mono font-bold transition-colors cursor-pointer"
                          >
                            {isEn ? 'Submit Reject' : 'Xác nhận bác bỏ'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          data-testid={`hypothesis-confirm-btn-${hypothesis.id}`}
                          disabled={isUpdatingStatus}
                          onClick={() => onUpdateStatus(hypothesis.id, { status: 'CONFIRMED' })}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-mono text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isEn ? 'Confirm' : 'Xác nhận'}</span>
                        </button>
                        <button
                          type="button"
                          data-testid={`hypothesis-reject-btn-${hypothesis.id}`}
                          disabled={isUpdatingStatus}
                          onClick={() => handleOpenRejectForm(hypothesis.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-50 text-rose-700 dark:text-rose-300 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>{isEn ? 'Reject' : 'Bác bỏ'}</span>
                        </button>
                      </div>
                    )
                  ) : (
                    <button
                      type="button"
                      data-testid={`hypothesis-reopen-btn-${hypothesis.id}`}
                      disabled={isUpdatingStatus}
                      onClick={() =>
                        onUpdateStatus(hypothesis.id, { status: 'UNDER_CONSIDERATION' })
                      }
                      className="w-full inline-flex items-center justify-center gap-1 py-1 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{isEn ? 'Reopen Review' : 'Xem xét lại'}</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn('flex-1 flex flex-col min-h-0 select-none', className)}
      data-testid="hypothesis-tab"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5 px-0.5 shrink-0">
        <span className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase inline-flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-sky-500" />
          {isEn ? 'AI HYPOTHESES' : 'GIẢ THUYẾT AI'}
        </span>
        <span className="font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400">
          {hypotheses.length} {isEn ? 'CANDIDATES' : 'GIẢ THUYẾT'}
        </span>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-1.5"
              >
                <div className="h-2.5 w-1/3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-4/5 rounded bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
              </div>
            ))}
          </div>
        ) : hypotheses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-2.5 text-slate-400 dark:text-slate-500">
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {isEn ? 'No hypotheses available' : 'Chưa có giả thuyết nào'}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              {isEn
                ? 'AI root-cause candidates for this incident will appear here.'
                : 'Các giả thuyết nguyên nhân gốc do AI đề xuất sẽ xuất hiện tại đây.'}
            </p>
          </div>
        ) : (
          <>
            {activeHypotheses.length > 0 && (
              <div className="space-y-2" data-testid="hypothesis-active-section">
                {activeHypotheses.map((h) => renderCard(h, false))}
              </div>
            )}

            {rejectedHypotheses.length > 0 && (
              <div className="pt-2 space-y-1.5" data-testid="hypothesis-rejected-section">
                <div className="flex items-center justify-between px-0.5">
                  <span className="font-mono text-[9px] font-extrabold tracking-widest text-rose-500/80 dark:text-rose-400/80 uppercase">
                    {isEn ? 'REJECTED' : 'ĐÃ BÁC BỎ'}
                  </span>
                  <span className="font-mono text-[9px] font-bold text-slate-400">
                    {rejectedHypotheses.length}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {rejectedHypotheses.map((h) => renderCard(h, true))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Incident Context Footer */}
      {incidentId && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[9.5px] text-slate-500 dark:text-slate-400 font-mono flex items-center justify-between shrink-0">
          <span>{isEn ? 'INCIDENT CONTEXT' : 'NGỮ CẢNH SỰ CỐ'}</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">{incidentId}</span>
        </div>
      )}
    </div>
  )
}
