import { RefreshCw } from 'lucide-react'

export interface OverviewGreetingProps {
  lastUpdatedText: string
  isRefreshing?: boolean
  locale?: 'vi' | 'en'
  onRefresh: () => void
}

export function OverviewGreeting({
  lastUpdatedText,
  isRefreshing = false,
  locale = 'vi',
  onRefresh,
}: OverviewGreetingProps) {
  const isEn = locale === 'en'

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl sm:text-[30px] font-extrabold tracking-[-0.01em] text-[#0f172a] dark:text-[#f8fafc] m-0">
          {isEn ? 'Network Overview' : 'Tổng quan mạng'}
        </h1>
        <div className="mt-1.5 text-[13px] text-[#64748b] dark:text-[#94a3b8]">
          {isEn ? 'Updated ' : 'Cập nhật '}
          <span className="font-mono font-bold text-[#334155] dark:text-[#cbd5e1]">{lastUpdatedText}</span>
          {isEn ? ' · auto-refreshes every 30s' : ' · tự làm mới mỗi 30 giây'}
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="h-9 px-3.5 bg-white dark:bg-[#1e293b] hover:bg-[#f8fafc] dark:hover:bg-[#334155] text-[#334155] dark:text-[#cbd5e1] border border-[#cbd5e1] dark:border-[#334155] hover:border-[#94a3b8] dark:hover:border-[#64748b] text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-60"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-[#64748b] dark:text-[#94a3b8] ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>{isEn ? 'Refresh' : 'Làm mới'}</span>
      </button>
    </div>
  )
}
