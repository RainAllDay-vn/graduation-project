import type { SaveStatus } from '@/context'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

export interface SettingsBannerProps {
  saveStatus: SaveStatus
  locale?: 'vi' | 'en'
  onSave: () => void
  onDiscard: () => void
  onDismissSaved?: () => void
}

export function SettingsBanner({
  saveStatus,
  locale = 'vi',
  onSave,
  onDiscard,
  onDismissSaved,
}: SettingsBannerProps) {
  const isEn = locale === 'en'

  if (saveStatus === 'idle') {
    return null
  }

  if (saveStatus === 'unsaved') {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="w-full flex items-center justify-between gap-3 bg-[#fffbeb] dark:bg-amber-950/40 border border-[#fde68a] dark:border-amber-800/50 text-[#b45309] dark:text-amber-300 rounded-xl px-4 py-2.5 text-[13px] font-semibold mb-3.5 shadow-xs animate-in fade-in"
      >
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="w-4 h-4 text-[#d97706] dark:text-amber-400 shrink-0" />
          <span className="truncate">
            {isEn ? 'You have unsaved changes.' : 'Bạn có thay đổi chưa lưu.'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onSave}
            className="h-7 px-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs border-0"
          >
            {isEn ? 'Save changes' : 'Lưu thay đổi'}
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="h-7 px-2.5 bg-white/90 dark:bg-[#1e293b] hover:bg-white dark:hover:bg-[#334155] text-[#475569] dark:text-[#cbd5e1] hover:text-[#0f172a] dark:hover:text-white border border-[#cbd5e1] dark:border-[#334155] text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {isEn ? 'Undo' : 'Hoàn tác'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full flex items-center justify-between gap-3 bg-[#f0fdf4] dark:bg-emerald-950/40 border border-[#bbf7d0] dark:border-emerald-800/50 text-[#15803d] dark:text-emerald-300 rounded-xl px-4 py-2.5 text-[13px] font-semibold mb-3.5 shadow-xs animate-in fade-in"
    >
      <div className="flex items-center gap-2 min-w-0">
        <CheckCircle2 className="w-4 h-4 text-[#16a34a] dark:text-emerald-400 shrink-0" />
        <span className="truncate">
          {isEn
            ? 'Saved — preferences applied to all your signed-in devices.'
            : 'Đã lưu — tùy chọn áp dụng cho mọi thiết bị đăng nhập của bạn.'}
        </span>
      </div>

      {onDismissSaved && (
        <button
          type="button"
          onClick={onDismissSaved}
          aria-label={isEn ? 'Dismiss notification' : 'Đóng thông báo'}
          className="p-1 text-[#15803d]/70 dark:text-emerald-300/70 hover:text-[#15803d] dark:hover:text-emerald-300 rounded transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
