export type KpiTone = 'normal' | 'warn' | 'bad'

export interface KpiItem {
  id: string
  label: string
  value: string | number
  tone?: KpiTone
  subtitle: string
  onClick?: () => void
}

export interface KpiGridProps {
  items: KpiItem[]
  isLoading?: boolean
}

export function KpiGrid({ items, isLoading = false }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((kpi) => {
        let valueColor = 'text-[#0f172a] dark:text-[#f8fafc]'
        if (kpi.tone === 'warn') {
          valueColor = 'text-[#d97706] dark:text-amber-400'
        } else if (kpi.tone === 'bad') {
          valueColor = 'text-[#dc2626] dark:text-red-400'
        }

        return (
          <div
            key={kpi.id}
            onClick={kpi.onClick}
            className={`bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#1e293b] rounded-xl p-4 sm:p-[18px] shadow-xs transition-all ${
              kpi.onClick ? 'cursor-pointer hover:border-[#1d4ed8]/40 dark:hover:border-blue-500/40 hover:shadow-sm' : ''
            }`}
          >
            <div className="font-mono font-extrabold text-[10.5px] tracking-[0.14em] text-[#64748b] dark:text-[#94a3b8] uppercase">
              {kpi.label}
            </div>

            <div className={`mt-2 font-extrabold text-[32px] leading-[1.1] ${valueColor}`}>
              {isLoading ? (
                <span className="text-[#cbd5e1] dark:text-[#334155] font-mono animate-pulse">—</span>
              ) : (
                kpi.value
              )}
            </div>

            <div className="mt-1.5 text-xs text-[#94a3b8] dark:text-[#64748b] truncate">
              {isLoading ? 'Đang tải dữ liệu…' : kpi.subtitle}
            </div>
          </div>
        )
      })}
    </div>
  )
}
