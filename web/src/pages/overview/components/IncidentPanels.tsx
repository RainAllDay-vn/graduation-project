import type { IncidentSummary } from '@/api/incidents'

export interface IncidentPanelsProps {
  openIncidents: IncidentSummary[]
  recentIncidents: IncidentSummary[]
  isLoading?: boolean
  locale?: 'vi' | 'en'
  onOpenDashboard: (incidentId: string) => void
}

function getSeverityBadge(severity: string, locale: 'vi' | 'en') {
  const isEn = locale === 'en'
  switch (severity) {
    case 'CRITICAL':
      return {
        label: isEn ? 'CRIT' : 'KHẨN',
        className: 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]',
      }
    case 'ERROR':
      return {
        label: isEn ? 'HIGH' : 'CAO',
        className: 'bg-[#ffedd5] text-[#9a3412] border border-[#fdba74]',
      }
    case 'WARNING':
      return {
        label: isEn ? 'MED' : 'TB',
        className: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
      }
    default:
      return {
        label: isEn ? 'LOW' : 'THẤP',
        className: 'bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1]',
      }
  }
}

function formatRelativeTime(dateString: string, locale: 'vi' | 'en'): string {
  try {
    const date = new Date(dateString)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return locale === 'en' ? `opened at ${hours}:${minutes}` : `mở ${hours}:${minutes}`
  } catch {
    return dateString
  }
}

export function IncidentPanels({
  openIncidents,
  recentIncidents,
  isLoading = false,
  locale = 'vi',
  onOpenDashboard,
}: IncidentPanelsProps) {
  const isEn = locale === 'en'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-4 items-start">
      {/* Left Panel: Open Incidents */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 font-mono font-extrabold text-[11px] tracking-[0.14em] text-[#64748b] px-4 sm:px-[18px] py-3.5 border-b border-[#e2e8f0]">
          <span>{isEn ? 'OPEN INCIDENTS' : 'SỰ CỐ ĐANG MỞ'}</span>
          <span className="ml-auto font-mono font-bold text-[11px] text-[#334155] bg-[#f1f5f9] px-2 py-0.5 rounded-full">
            {openIncidents.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : openIncidents.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-[13.5px] font-bold text-[#0f172a]">
              {isEn ? 'No open incidents.' : 'Chưa có sự cố nào đang mở.'}
            </div>
            <div className="text-xs text-[#64748b] mt-1">
              {isEn
                ? 'All systems operational — incidents will appear here automatically.'
                : 'Mọi thứ hoạt động bình thường — danh sách sẽ tự xuất hiện khi có sự cố.'}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {openIncidents.map((inc) => {
              const badge = getSeverityBadge(inc.severity, locale)
              return (
                <div
                  key={inc.id}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 px-4 sm:px-[18px] py-3.5 hover:bg-[#f8fafc] transition-colors"
                >
                  <span
                    className={`font-mono font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded-md shrink-0 ${badge.className}`}
                  >
                    {badge.label}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-bold text-[#0f172a] truncate">
                      <span className="font-mono text-[#1d4ed8] mr-1">{inc.id}</span>
                      <span>·</span>
                      <span className="ml-1">{inc.title}</span>
                    </div>
                    <div className="text-xs text-[#64748b] mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{formatRelativeTime(inc.openedAt, locale)}</span>
                      <span>·</span>
                      <span>{inc.region}</span>
                      <span>·</span>
                      <span>
                        {inc.alarmCount}{' '}
                        {isEn ? 'correlated alarms' : 'cảnh báo liên quan'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenDashboard(inc.id)}
                    className="ml-auto text-[13px] font-bold text-[#1d4ed8] hover:underline bg-transparent border-0 cursor-pointer p-0 shrink-0"
                  >
                    {isEn ? 'Open Dashboard →' : 'Mở Dashboard →'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right Panel: Recently Resolved Incidents */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 font-mono font-extrabold text-[11px] tracking-[0.14em] text-[#64748b] px-4 sm:px-[18px] py-3.5 border-b border-[#e2e8f0]">
          <span>{isEn ? 'RECENTLY RESOLVED' : 'ĐÃ XỬ LÝ GẦN ĐÂY'}</span>
          <span className="ml-auto font-mono font-bold text-[11px] text-[#334155] bg-[#f1f5f9] px-2 py-0.5 rounded-full">
            {recentIncidents.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentIncidents.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-[13.5px] font-bold text-[#0f172a]">
              {isEn ? 'No incident history.' : 'Chưa có lịch sử.'}
            </div>
            <div className="text-xs text-[#64748b] mt-1">
              {isEn
                ? 'Resolved incidents will be listed here with recovery metrics.'
                : 'Sự cố đã xử lý sẽ liệt kê ở đây kèm thời gian khôi phục.'}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {recentIncidents.map((inc) => (
              <div
                key={inc.id}
                className="flex items-center gap-3.5 px-4 sm:px-[18px] py-3.5 hover:bg-[#f8fafc] transition-colors"
              >
                <span className="font-mono font-extrabold text-[10px] tracking-wider px-2 py-0.5 rounded-md shrink-0 bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
                  {isEn ? 'RESOLVED' : 'XONG'}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold text-[#0f172a] truncate">
                    <span className="font-mono text-[#475569] mr-1">{inc.id}</span>
                    <span>·</span>
                    <span className="ml-1">{inc.title}</span>
                  </div>
                  <div className="text-xs text-[#64748b] mt-0.5 truncate">
                    <span>{inc.region}</span>
                    <span> · </span>
                    <span>{formatRelativeTime(inc.openedAt, locale)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
