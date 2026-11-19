import React from 'react'
import { AlertTriangle, Clock, RefreshCw, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SessionExpiryWarningModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Remaining seconds before automatic sign-off */
  remainingSeconds: number
  /** Total warning countdown duration in seconds (for calculating progress bar, default: 60) */
  totalWarningSeconds?: number
  /** Callback fired when user chooses to stay signed in / extend session */
  onExtend: () => void
  /** Callback fired when user chooses to sign off immediately */
  onSignOff: () => void
  /** Language locale */
  locale?: 'vi' | 'en'
  /** Optional loading state while refreshing session */
  isExtending?: boolean
}

export const SessionExpiryWarningModal: React.FC<SessionExpiryWarningModalProps> = ({
  isOpen,
  remainingSeconds,
  totalWarningSeconds = 60,
  onExtend,
  onSignOff,
  locale = 'vi',
  isExtending = false,
}) => {
  if (!isOpen) return null

  const isEn = locale === 'en'

  // Format seconds as MM:SS
  const mins = Math.floor(remainingSeconds / 60)
  const secs = remainingSeconds % 60
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  // Progress percentage (100% at start -> 0% at timeout)
  const progressPercent = Math.max(
    0,
    Math.min(100, (remainingSeconds / totalWarningSeconds) * 100)
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-warning-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 dark:bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        className={cn(
          'bg-white dark:bg-[#0b0f19] border border-slate-200 dark:border-slate-800',
          'rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150 select-none'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon + Badge */}
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-mono text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
            NOC SECURITY · 15 MIN AFK
          </span>
        </div>

        {/* Title & Description */}
        <div className="mt-4">
          <h3
            id="session-warning-title"
            className="text-lg font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {isEn ? 'Session Inactivity Warning' : 'Cảnh báo hết hạn phiên làm việc'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-sans">
            {isEn
              ? 'You have been inactive for nearly 15 minutes. For security compliance, your session will automatically sign off soon.'
              : 'Bạn đã không thao tác trong gần 15 phút. Theo quy định an toàn NOC, hệ thống sẽ tự động đăng xuất nếu không có phản hồi.'}
          </p>
        </div>

        {/* Countdown Box */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
              {isEn ? 'Auto Sign-Off In' : 'Tự động đăng xuất sau'}
            </span>
          </div>

          <div
            className={cn(
              'font-mono text-3xl font-extrabold tracking-wider my-1',
              remainingSeconds <= 15
                ? 'text-rose-500 animate-pulse'
                : 'text-amber-500'
            )}
          >
            {formattedTime}
          </div>

          {/* Linear countdown indicator */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000',
                remainingSeconds <= 15 ? 'bg-rose-500' : 'bg-amber-500'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onSignOff}
            disabled={isExtending}
            className={cn(
              'h-9 px-4 rounded-lg font-mono text-xs font-bold transition-colors cursor-pointer',
              'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white',
              'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700',
              'border border-slate-300 dark:border-slate-700 flex items-center gap-1.5'
            )}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isEn ? 'Sign Out Now' : 'Đăng xuất ngay'}</span>
          </button>

          <button
            type="button"
            onClick={onExtend}
            disabled={isExtending}
            className={cn(
              'h-9 px-4 rounded-lg font-mono text-xs font-bold text-white transition-all cursor-pointer shadow-sm',
              'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] border border-emerald-500/50',
              'flex items-center gap-1.5 disabled:opacity-50'
            )}
          >
            {isExtending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>{isEn ? 'Stay Signed In' : 'Gia hạn phiên'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionExpiryWarningModal
