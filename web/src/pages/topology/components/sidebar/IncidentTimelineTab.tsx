import React, { useMemo } from 'react'
import type { AlarmSummary, Severity } from '@/api/incidents'
import { cn } from '@/lib/utils'
import { AlertCircle, BookOpen, Clock, Cpu } from 'lucide-react'

export interface IncidentTimelineTabProps {
  incidentId?: string | null
  alarms: AlarmSummary[]
  isLoading?: boolean
  selectedAlarmId?: string | null
  onSelectAlarm: (alarm: AlarmSummary) => void
  onSelectFaultCode?: (faultCode: string, alarm: AlarmSummary) => void
  locale?: 'vi' | 'en'
  className?: string
}

function getSeverityDotClass(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.75)]'
    case 'ERROR':
      return 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.65)]'
    case 'WARNING':
      return 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.65)]'
    case 'INFO':
    default:
      return 'bg-sky-500 shadow-[0_0_5px_rgba(14,165,233,0.5)]'
  }
}

function getFaultBadgeClass(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 hover:bg-rose-500/20'
    case 'ERROR':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/25 hover:bg-orange-500/20'
    case 'WARNING':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 hover:bg-amber-500/20'
    case 'INFO':
    default:
      return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25 hover:bg-sky-500/20'
  }
}

function formatAlarmTime(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export const IncidentTimelineTab: React.FC<IncidentTimelineTabProps> = ({
  incidentId,
  alarms,
  isLoading = false,
  selectedAlarmId,
  onSelectAlarm,
  onSelectFaultCode,
  locale = 'vi',
  className,
}) => {
  const isEn = locale === 'en'

  // Sort newest alarms first (§4.2)
  const sortedAlarms = useMemo(() => {
    return [...alarms].sort((a, b) => {
      const timeB = Date.parse(b.timestamp) || 0
      const timeA = Date.parse(a.timestamp) || 0
      return timeB - timeA
    })
  }, [alarms])

  return (
    <div
      className={cn('flex-1 flex flex-col min-h-0 select-none', className)}
      data-testid="incident-timeline-tab"
    >
      {/* Header & Count */}
      <div className="flex items-center justify-between mb-2.5 px-0.5 shrink-0">
        <span className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase">
          {isEn ? 'ALARM TIMELINE' : 'TIMELINE CẢNH BÁO'}
        </span>
        <span className="font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400">
          {sortedAlarms.length} {isEn ? 'EVENTS' : 'CẢNH BÁO'}
        </span>
      </div>

      {/* Scrollable Timeline List */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-0.5"
        data-testid="incident-timeline-list"
      >
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-1.5"
              >
                <div className="h-2.5 w-2/3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
                <div className="h-2.5 w-full rounded bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
              </div>
            ))}
          </div>
        ) : sortedAlarms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-2.5 text-slate-400 dark:text-slate-500">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {isEn ? 'No alarms recorded' : 'Chưa có cảnh báo nào'}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              {isEn
                ? 'Alarm events linked to this incident will appear chronologically.'
                : 'Các cảnh báo gắn với sự cố sẽ xuất hiện tại đây.'}
            </p>
          </div>
        ) : (
          <div className="relative pl-3 space-y-2">
            {/* Vertical timeline rail */}
            <div
              className="absolute left-[5px] top-2.5 bottom-2.5 w-px bg-slate-200 dark:bg-slate-800"
              aria-hidden="true"
            />

            {sortedAlarms.map((alarm) => {
              const isSelected = selectedAlarmId === alarm.id
              return (
                <div
                  key={alarm.id}
                  role="button"
                  tabIndex={0}
                  data-testid={`timeline-alarm-${alarm.id}`}
                  data-selected={isSelected}
                  onClick={() => onSelectAlarm(alarm)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectAlarm(alarm)
                    }
                  }}
                  className={cn(
                    'group relative p-2.5 rounded-lg border transition-all duration-150 cursor-pointer outline-none',
                    isSelected
                      ? 'bg-sky-500/10 dark:bg-sky-500/15 border-sky-500/50 shadow-xs'
                      : 'bg-slate-50/80 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  {/* Severity Dot on Timeline Rail */}
                  <span
                    className={cn(
                      'absolute -left-[12px] top-3.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#0f172a]',
                      getSeverityDotClass(alarm.severity)
                    )}
                    title={`${alarm.severity}`}
                  />

                  {/* Top Row: Timestamp + Device Chip */}
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span
                      className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums"
                      title={alarm.timestamp}
                    >
                      <Clock className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500 shrink-0" />
                      {formatAlarmTime(alarm.timestamp)}
                    </span>

                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9.5px] font-bold tracking-tight',
                        isSelected
                          ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300'
                          : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400'
                      )}
                    >
                      <Cpu className="w-2.5 h-2.5 shrink-0 opacity-75" />
                      {alarm.deviceId}
                    </span>
                  </div>

                  {/* Fault Code Link Badge */}
                  {alarm.faultCode && (
                    <div className="mb-1.5 flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        data-testid={`timeline-fault-code-${alarm.id}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectFaultCode?.(alarm.faultCode, alarm)
                        }}
                        title={
                          isEn
                            ? `Open troubleshooting doc for ${alarm.faultCode}`
                            : `Tra cứu tài liệu mã lỗi ${alarm.faultCode}`
                        }
                        className={cn(
                          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-mono text-[9.5px] font-bold tracking-tight transition-colors cursor-pointer outline-none',
                          getFaultBadgeClass(alarm.severity)
                        )}
                      >
                        <BookOpen className="w-2.5 h-2.5 shrink-0" />
                        <span>{alarm.faultCode}</span>
                      </button>

                      {!alarm.isCurrentIncident && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[8.5px] font-semibold">
                          {isEn ? 'EXTERNAL' : 'NGOÀI SỰ CỐ'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Alarm Message */}
                  <p className="text-[11px] leading-snug text-slate-700 dark:text-slate-300 font-sans break-words">
                    {alarm.message}
                  </p>
                </div>
              )
            })}
          </div>
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
