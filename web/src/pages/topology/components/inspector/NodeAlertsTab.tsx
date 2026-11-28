import React, { useMemo, useState } from 'react'
import type { AlarmSummary, Severity } from '@/api/incidents'
import type { DeviceSummary } from '@/api/topology'
import { cn } from '@/lib/utils'
import { ArrowLeft, BellOff, BookOpen, Clock, ShieldAlert } from 'lucide-react'

export interface NodeAlertsTabProps {
  node: DeviceSummary
  incidentId?: string | null
  alarms?: AlarmSummary[]
  isLoading?: boolean
  onSelectFaultCode?: (faultCode: string, alarm: AlarmSummary) => void
  locale?: 'vi' | 'en'
  className?: string
}

function getSeverityDotClass(severity: Severity, isCurrentIncident: boolean): string {
  if (!isCurrentIncident) {
    return 'bg-slate-400 dark:bg-slate-500'
  }
  switch (severity) {
    case 'CRITICAL':
    case 'ERROR':
      return 'bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.75)]'
    case 'WARNING':
      return 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.65)]'
    case 'INFO':
    default:
      return 'bg-sky-500'
  }
}

function getAlertCardClass(severity: Severity, isCurrentIncident: boolean): string {
  if (!isCurrentIncident) {
    return 'bg-slate-100/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70'
  }
  if (severity === 'CRITICAL' || severity === 'ERROR') {
    return 'bg-rose-500/8 dark:bg-rose-500/12 border-rose-500/35 hover:border-rose-500/60'
  }
  return 'bg-amber-500/8 dark:bg-amber-500/12 border-amber-500/35 hover:border-amber-500/60'
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

function formatAlarmDateTime(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export const NodeAlertsTab: React.FC<NodeAlertsTabProps> = ({
  node,
  incidentId,
  alarms = [],
  isLoading = false,
  onSelectFaultCode,
  locale = 'vi',
  className,
}) => {
  const isEn = locale === 'en'
  const [selectedAlarmId, setSelectedAlarmId] = useState<string | null>(null)

  // Scope alarms to the selected device, newest first (§5.2)
  const deviceAlarms = useMemo(() => {
    return alarms
      .filter((a) => a.deviceId === node.id)
      .sort((a, b) => (Date.parse(b.timestamp) || 0) - (Date.parse(a.timestamp) || 0))
  }, [alarms, node.id])

  const selectedAlarm = useMemo(
    () => (selectedAlarmId ? deviceAlarms.find((a) => a.id === selectedAlarmId) ?? null : null),
    [deviceAlarms, selectedAlarmId]
  )

  return (
    <div
      className={cn('flex-1 flex flex-col min-h-0 gap-2.5', className)}
      role="tabpanel"
      data-testid="inspector-panel-alerts"
    >
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-2"
            >
              <div className="h-2.5 w-1/2 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-3 w-full rounded bg-slate-200/70 dark:bg-slate-800/70 animate-pulse" />
            </div>
          ))}
        </div>
      ) : selectedAlarm ? (
        /* Alarm Detail View + Back to List Button (§5.2) */
        <div
          className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar"
          data-testid="node-alerts-detail"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              data-testid="node-alerts-back-btn"
              onClick={() => setSelectedAlarmId(null)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>{isEn ? 'BACK TO LIST' : 'DANH SÁCH'}</span>
            </button>

            <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
              {selectedAlarm.id}
            </span>
          </div>

          <div
            className={cn(
              'p-3 rounded-lg border space-y-2.5',
              getAlertCardClass(selectedAlarm.severity, selectedAlarm.isCurrentIncident)
            )}
          >
            {/* Status & Severity Header */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'w-2.5 h-2.5 rounded-full shrink-0',
                    getSeverityDotClass(selectedAlarm.severity, selectedAlarm.isCurrentIncident)
                  )}
                />
                <span className="font-mono text-[10.5px] font-extrabold text-slate-900 dark:text-slate-100">
                  {selectedAlarm.severity}
                </span>
              </div>

              <span
                className={cn(
                  'px-1.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase border',
                  selectedAlarm.isCurrentIncident
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/35'
                    : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300/60 dark:border-slate-700'
                )}
              >
                {selectedAlarm.isCurrentIncident
                  ? isEn
                    ? 'Current Incident'
                    : 'Thuộc sự cố'
                  : isEn
                    ? 'External Alarm'
                    : 'Ngoài sự cố'}
              </span>
            </div>

            {/* Metadata Grid */}
            <div className="p-2 rounded bg-white/75 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 font-mono text-[10px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isEn ? 'Device:' : 'Thiết bị:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedAlarm.deviceId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isEn ? 'Timestamp:' : 'Thời điểm:'}</span>
                <span className="text-slate-700 dark:text-slate-300 tabular-nums">
                  {formatAlarmDateTime(selectedAlarm.timestamp)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{isEn ? 'Classifier:' : 'Loại:'}</span>
                <span className="text-slate-700 dark:text-slate-300">{selectedAlarm.alarmType}</span>
              </div>
              {incidentId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{isEn ? 'Incident:' : 'Sự cố:'}</span>
                  <span className="text-slate-700 dark:text-slate-300">{incidentId}</span>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <div className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isEn ? 'ALARM MESSAGE' : 'NỘI DUNG CẢNH BÁO'}
              </div>
              <p className="text-[11.5px] leading-relaxed text-slate-800 dark:text-slate-200 font-sans">
                {selectedAlarm.message}
              </p>
            </div>

            {/* Fault Code Runbook Trigger */}
            {selectedAlarm.faultCode && (
              <button
                type="button"
                data-testid={`node-alert-detail-fault-${selectedAlarm.id}`}
                onClick={() => onSelectFaultCode?.(selectedAlarm.faultCode, selectedAlarm)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md border border-sky-500/35 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-mono text-[10px] font-bold transition-colors cursor-pointer"
              >
                <BookOpen className="w-3 h-3 shrink-0" />
                <span>
                  {isEn
                    ? `Lookup Runbook: ${selectedAlarm.faultCode}`
                    : `Tra cứu tài liệu: ${selectedAlarm.faultCode}`}
                </span>
              </button>
            )}
          </div>
        </div>
      ) : deviceAlarms.length === 0 ? (
        /* Empty State */
        <div
          className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
          data-testid="node-alerts-empty"
        >
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-2 text-slate-400 dark:text-slate-500">
            <BellOff className="w-4 h-4" />
          </div>
          <p className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-300">
            {isEn ? `No alarms on ${node.id}` : `Không có cảnh báo trên ${node.id}`}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            {isEn
              ? 'No fault or rule alerts are associated with this device in the current incident.'
              : 'Thiết bị này chưa ghi nhận cảnh báo nào trong phiên sự cố hiện tại.'}
          </p>
        </div>
      ) : (
        /* Alarm List View */
        <div className="flex-1 flex flex-col min-h-0 gap-2">
          <div className="flex items-center justify-between px-0.5 shrink-0">
            <span className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase inline-flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-500" />
              {isEn ? 'DEVICE ALERTS' : 'CẢNH BÁO THIẾT BỊ'}
            </span>
            <span className="font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400">
              {deviceAlarms.length} {isEn ? 'TOTAL' : 'MỤC'}
            </span>
          </div>

          <div
            className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-0.5"
            data-testid="node-alerts-list"
          >
            {deviceAlarms.map((alarm) => (
              <div
                key={alarm.id}
                role="button"
                tabIndex={0}
                data-testid={`node-alert-row-${alarm.id}`}
                data-current-incident={alarm.isCurrentIncident}
                onClick={() => setSelectedAlarmId(alarm.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedAlarmId(alarm.id)
                  }
                }}
                className={cn(
                  'p-2.5 rounded-lg border transition-all duration-150 cursor-pointer outline-none space-y-1.5',
                  getAlertCardClass(alarm.severity, alarm.isCurrentIncident)
                )}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        getSeverityDotClass(alarm.severity, alarm.isCurrentIncident)
                      )}
                    />
                    <span className="font-mono text-[10px] font-extrabold text-slate-800 dark:text-slate-100">
                      {alarm.severity}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 font-mono text-[9.5px] text-slate-500 dark:text-slate-400 tabular-nums">
                    <Clock className="w-2.5 h-2.5" />
                    {formatAlarmTime(alarm.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {alarm.faultCode && (
                    <button
                      type="button"
                      data-testid={`node-alert-fault-code-${alarm.id}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectFaultCode?.(alarm.faultCode, alarm)
                      }}
                      className={cn(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded border font-mono text-[9.5px] font-bold transition-colors cursor-pointer',
                        alarm.isCurrentIncident
                          ? 'bg-white/80 dark:bg-slate-900/70 text-sky-700 dark:text-sky-300 border-sky-500/35 hover:bg-sky-500/15'
                          : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                      )}
                    >
                      <BookOpen className="w-2.5 h-2.5" />
                      <span>{alarm.faultCode}</span>
                    </button>
                  )}

                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded font-mono text-[8.5px] font-bold uppercase',
                      alarm.isCurrentIncident
                        ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {alarm.isCurrentIncident
                      ? isEn
                        ? 'INCIDENT'
                        : 'TRONG SỰ CỐ'
                      : isEn
                        ? 'EXTERNAL'
                        : 'NGOÀI SỰ CỐ'}
                  </span>
                </div>

                <p className="text-[11px] leading-snug text-slate-700 dark:text-slate-300 line-clamp-2 font-sans">
                  {alarm.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
