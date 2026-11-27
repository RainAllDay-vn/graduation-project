import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  Clock,
  Cpu,
  HardDrive,
  LineChart as LineChartIcon,
  Network,
  RefreshCw,
  Route,
  Thermometer,
} from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getDeviceAvailableMetrics,
  getDeviceMetricTimeseries,
  getDeviceTelemetrySnapshot,
  type DeviceTelemetrySnapshotDetails,
  type TelemetryMetricSeries,
} from '@/api/telemetry'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import { cn } from '@/lib/utils'

export type TimeAnchorMode = 'collected' | 'now'
export type TimeWindowKey = '15m' | '1h' | '6h' | '24h'

const WINDOW_MINUTES: Record<TimeWindowKey, number> = {
  '15m': 15,
  '1h': 60,
  '6h': 360,
  '24h': 1440,
}

export interface TelemetryMockData {
  snapshot: DeviceTelemetrySnapshotDetails | null
  availableMetrics: string[]
  seriesByMetric?: Record<string, TelemetryMetricSeries>
}

export interface NodeTelemetryTabProps {
  node: DeviceSummary
  links?: LinkSummary[]
  onSelectLink?: (link: LinkSummary) => void
  /** Optional initial selected timeseries metric (null by default per Stylebook §5.3) */
  initialMetric?: string | null
  /** Optional mock dataset strictly for Storybook / unit testing */
  mockTelemetry?: TelemetryMockData
  locale?: 'vi' | 'en'
  className?: string
}

function formatUptime(seconds: number | null | undefined, isEn: boolean): string {
  if (seconds == null || seconds < 0) return '—'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) {
    return isEn ? `${days}d ${hours}h` : `${days} ngày ${hours}g`
  }
  if (hours > 0) {
    return isEn ? `${hours}h ${mins}m` : `${hours} giờ ${mins}p`
  }
  return isEn ? `${mins}m` : `${mins} phút`
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} · ${pad(
    d.getDate()
  )}/${pad(d.getMonth() + 1)}`
}

function formatShortTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getMetricDisplayLabel(metric: string, isEn: boolean): string {
  const upper = metric.toUpperCase()
  if (upper === 'CPU') return 'CPU'
  if (upper === 'TEMPERATURE') return isEn ? 'Temperature' : 'Nhiệt độ'
  if (upper === 'MEMORY') return isEn ? 'Memory' : 'RAM'
  if (upper === 'LOAD') return isEn ? 'System Load' : 'Tải HT'
  return metric
}

/**
 * Node Operational Status & Live Telemetry Tab (Stylebook §5.3)
 *
 * Displays all real snapshot metrics (operStatus, uptimeSeconds, loadPercentage,
 * routesLearned/Used, cpuPercent, memoryPercent, temperatureCelsius) with `collectedAt`.
 * Timeseries metrics can be clicked to highlight and plot a Recharts line chart
 * with quick time anchor & window controls. Initially no metric is highlighted.
 */
export const NodeTelemetryTab: React.FC<NodeTelemetryTabProps> = ({
  node,
  links = [],
  onSelectLink,
  initialMetric = null,
  mockTelemetry,
  locale = 'vi',
  className,
}) => {
  const isEn = locale === 'en'

  // Stylebook §5.3: Default is NO timeseries metric highlighted (chart empty until clicked)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(initialMetric)
  const [timeAnchor, setTimeAnchor] = useState<TimeAnchorMode>('collected')
  const [timeWindow, setTimeWindow] = useState<TimeWindowKey>('1h')
  const [nowMillis, setNowMillis] = useState<number>(() => Date.now())

  const snapshotQuery = useQuery({
    queryKey: ['telemetry', 'snapshot', node.id],
    queryFn: () => getDeviceTelemetrySnapshot(node.id),
    enabled: !mockTelemetry,
    staleTime: 15000,
    retry: false,
  })

  const metricsQuery = useQuery({
    queryKey: ['telemetry', 'metrics', node.id],
    queryFn: () => getDeviceAvailableMetrics(node.id),
    enabled: !mockTelemetry,
    staleTime: 30000,
    retry: false,
  })

  const snapshot = mockTelemetry ? mockTelemetry.snapshot : snapshotQuery.data ?? null
  const availableMetrics = useMemo(
    () => (mockTelemetry ? mockTelemetry.availableMetrics : metricsQuery.data ?? []),
    [mockTelemetry, metricsQuery.data]
  )
  const availableMetricUpperSet = useMemo(
    () => new Set(availableMetrics.map((m) => m.toUpperCase())),
    [availableMetrics]
  )

  const findMetricName = (targetUpper: string): string | null => {
    const found = availableMetrics.find((m) => m.toUpperCase() === targetUpper)
    return found ?? null
  }

  const effectiveAnchor: TimeAnchorMode =
    timeAnchor === 'collected' && snapshot?.collectedAt ? 'collected' : 'now'

  const { startIso, endIso } = useMemo(() => {
    const endMs =
      effectiveAnchor === 'collected' && snapshot?.collectedAt
        ? new Date(snapshot.collectedAt).getTime()
        : nowMillis
    const safeEndMs = Number.isNaN(endMs) ? nowMillis : endMs
    const startMs = safeEndMs - WINDOW_MINUTES[timeWindow] * 60 * 1000
    return {
      startIso: new Date(startMs).toISOString(),
      endIso: new Date(safeEndMs).toISOString(),
    }
  }, [effectiveAnchor, snapshot?.collectedAt, nowMillis, timeWindow])

  const seriesQuery = useQuery({
    queryKey: ['telemetry', 'series', node.id, selectedMetric, startIso, endIso],
    queryFn: () =>
      getDeviceMetricTimeseries(node.id, {
        metricName: selectedMetric as string,
        start: startIso,
        end: endIso,
      }),
    enabled: !mockTelemetry && Boolean(selectedMetric),
    staleTime: 15000,
    retry: false,
  })

  const activeSeries: TelemetryMetricSeries | null = useMemo(() => {
    if (!selectedMetric) return null
    if (mockTelemetry) {
      const raw = mockTelemetry.seriesByMetric?.[selectedMetric]
      if (!raw) return null
      const startMs = new Date(startIso).getTime()
      const endMs = new Date(endIso).getTime()
      const filteredPoints = raw.points.filter((pt) => {
        const ptMs = new Date(pt.timestamp).getTime()
        return ptMs >= startMs && ptMs <= endMs
      })
      return { ...raw, points: filteredPoints }
    }
    return seriesQuery.data ?? null
  }, [selectedMetric, mockTelemetry, seriesQuery.data, startIso, endIso])

  const chartData = useMemo(() => {
    if (!activeSeries?.points) return []
    return activeSeries.points.map((pt) => ({
      time: formatShortTime(pt.timestamp),
      fullTime: formatDateTime(pt.timestamp),
      value: pt.value,
      unit: pt.unit ?? activeSeries.unit ?? '',
    }))
  }, [activeSeries])

  const connectedLinks = useMemo(
    () =>
      links.filter(
        (l) => l.sourceDeviceId === node.id || l.targetDeviceId === node.id
      ),
    [links, node.id]
  )

  const handleMetricToggle = (metricName: string | null) => {
    if (!metricName) return
    setSelectedMetric((prev) => (prev === metricName ? null : metricName))
  }

  const handleRefresh = () => {
    setNowMillis(Date.now())
    if (!mockTelemetry) {
      snapshotQuery.refetch()
      metricsQuery.refetch()
      if (selectedMetric) seriesQuery.refetch()
    }
  }

  const cpuMetricKey = findMetricName('CPU')
  const tempMetricKey = findMetricName('TEMPERATURE')
  const memMetricKey = findMetricName('MEMORY')
  const loadMetricKey = findMetricName('LOAD')

  // Any timeseries metrics not already bound to one of the standard snapshot cards
  const extraTimeseriesMetrics = availableMetrics.filter((m) => {
    const u = m.toUpperCase()
    return u !== 'CPU' && u !== 'TEMPERATURE' && u !== 'MEMORY' && u !== 'LOAD'
  })

  const isLoadingSnapshot = !mockTelemetry && snapshotQuery.isLoading

  const lineStrokeColor = useMemo(() => {
    const upper = (selectedMetric || '').toUpperCase()
    if (upper === 'TEMPERATURE') return '#f59e0b'
    if (upper === 'CPU') return '#38bdf8'
    if (upper === 'MEMORY') return '#8b5cf6'
    return '#10b981'
  }, [selectedMetric])

  return (
    <div
      className={cn('flex-1 flex flex-col gap-3', className)}
      role="tabpanel"
      data-testid="inspector-panel-telemetry"
    >
      {/* 1. Timestamp Bar (collected_at reliability notice + Refresh) */}
      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0b111e] border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 min-w-0">
          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
          <div className="min-w-0">
            <div className="font-mono text-[8.5px] uppercase tracking-wider text-slate-400">
              {isEn ? 'COLLECTED AT' : 'THỜI ĐIỂM THU THẬP'}
            </div>
            <div
              className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate"
              data-testid="telemetry-collected-at"
            >
              {isLoadingSnapshot
                ? isEn
                  ? 'Loading...'
                  : 'Đang tải...'
                : formatDateTime(snapshot?.collectedAt)}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          data-testid="telemetry-refresh-btn"
          title={isEn ? 'Refresh telemetry' : 'Làm mới dữ liệu'}
          className="p-1.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw
            className={cn(
              'w-3 h-3',
              (snapshotQuery.isFetching || seriesQuery.isFetching) && 'animate-spin text-sky-500'
            )}
          />
        </button>
      </div>

      {/* 2. Snapshot Operational Metrics */}
      {isLoadingSnapshot ? (
        <div
          className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b111e] text-center font-mono text-[11px] text-slate-400"
          data-testid="telemetry-loading"
        >
          {isEn ? 'Fetching telemetry snapshot...' : 'Đang tải thông số vận hành...'}
        </div>
      ) : snapshotQuery.isError && !mockTelemetry ? (
        <div
          className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 font-sans text-[11px] text-rose-600 dark:text-rose-400"
          data-testid="telemetry-error"
        >
          {isEn
            ? 'Unable to load device telemetry snapshot from server.'
            : 'Không thể tải dữ liệu telemetry từ máy chủ.'}
        </div>
      ) : !snapshot ? (
        <div
          className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0b111e] font-sans text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed"
          data-testid="telemetry-empty-snapshot"
        >
          {isEn
            ? `No telemetry snapshot recorded for ${node.id} yet.`
            : `Chưa có bản ghi snapshot telemetry nào cho thiết bị ${node.id}.`}
        </div>
      ) : (
        <div className="space-y-2" data-testid="telemetry-snapshot-grid">
          {/* Row A: operStatus + uptimeSeconds */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b111e] border border-slate-200 dark:border-slate-800">
              <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                oper_status
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    snapshot.operStatus === 'UP'
                      ? 'bg-emerald-500'
                      : snapshot.operStatus === 'DEGRADED'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  )}
                />
                <span
                  className={cn(
                    'font-mono text-xs font-extrabold',
                    snapshot.operStatus === 'UP'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : snapshot.operStatus === 'DEGRADED'
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  )}
                  data-testid="telemetry-oper-status"
                >
                  {snapshot.operStatus}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b111e] border border-slate-200 dark:border-slate-800">
              <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Uptime
              </div>
              <div
                className="font-mono text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-1"
                data-testid="telemetry-uptime"
              >
                {formatUptime(snapshot.uptimeSeconds, isEn)}
              </div>
            </div>
          </div>

          {/* Row B: System Load + Routes Learned/Used */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!loadMetricKey}
              onClick={() => handleMetricToggle(loadMetricKey)}
              data-testid="telemetry-card-load"
              className={cn(
                'text-left p-2.5 rounded-lg border transition-all',
                loadMetricKey
                  ? 'cursor-pointer hover:border-sky-400 dark:hover:border-sky-500'
                  : 'cursor-default',
                selectedMetric && selectedMetric === loadMetricKey
                  ? 'bg-sky-500/10 border-sky-500 ring-1 ring-sky-500/40'
                  : 'bg-slate-50 dark:bg-[#0b111e] border-slate-200 dark:border-slate-800'
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-sky-500" />
                  {isEn ? 'Load' : 'Mức tải'}
                </span>
                {loadMetricKey && (
                  <span className="font-mono text-[8px] font-bold px-1 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    TS
                  </span>
                )}
              </div>
              <div
                className={cn(
                  'font-mono text-sm font-extrabold mt-0.5',
                  (snapshot.loadPercentage ?? 0) >= 85
                    ? 'text-rose-500'
                    : (snapshot.loadPercentage ?? 0) >= 65
                    ? 'text-amber-500'
                    : 'text-slate-900 dark:text-white'
                )}
                data-testid="telemetry-load-value"
              >
                {snapshot.loadPercentage != null ? `${snapshot.loadPercentage}%` : '—'}
              </div>
            </button>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b111e] border border-slate-200 dark:border-slate-800">
              <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Route className="w-3 h-3 text-indigo-400" />
                {isEn ? 'Routes' : 'Routes'}
              </div>
              <div
                className="font-mono text-xs font-extrabold text-slate-900 dark:text-white mt-1"
                data-testid="telemetry-routes-value"
              >
                {snapshot.routesUsed != null && snapshot.routesLearned != null
                  ? `${snapshot.routesUsed.toLocaleString()} / ${snapshot.routesLearned.toLocaleString()}`
                  : snapshot.routesLearned != null
                  ? snapshot.routesLearned.toLocaleString()
                  : '—'}
              </div>
              <div className="font-mono text-[8.5px] text-slate-400">
                {isEn ? 'used / learned' : 'đang dùng / đã học'}
              </div>
            </div>
          </div>

          {/* Row C: Timeseries-capable hardware metrics (CPU, Memory, Temperature) */}
          <div className="grid grid-cols-3 gap-1.5">
            {/* CPU */}
            <button
              type="button"
              disabled={!cpuMetricKey}
              onClick={() => handleMetricToggle(cpuMetricKey)}
              data-testid="telemetry-card-CPU"
              title={
                cpuMetricKey
                  ? isEn
                    ? 'Click to toggle CPU timeseries chart'
                    : 'Bấm để xem biểu đồ CPU'
                  : undefined
              }
              className={cn(
                'text-left p-2 rounded-lg border transition-all',
                cpuMetricKey
                  ? 'cursor-pointer hover:border-sky-400 dark:hover:border-sky-500'
                  : 'cursor-default',
                selectedMetric && selectedMetric === cpuMetricKey
                  ? 'bg-sky-500/10 border-sky-500 ring-1 ring-sky-500/40'
                  : 'bg-slate-50 dark:bg-[#0b111e] border-slate-200 dark:border-slate-800'
              )}
            >
              <div className="flex items-center justify-between">
                <Cpu className="w-3 h-3 text-sky-500" />
                {availableMetricUpperSet.has('CPU') && (
                  <span className="font-mono text-[7.5px] font-bold px-1 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    TS
                  </span>
                )}
              </div>
              <div className="font-mono text-[8.5px] text-slate-500 dark:text-slate-400 mt-1">
                CPU
              </div>
              <div
                className={cn(
                  'font-mono text-xs font-extrabold',
                  (snapshot.cpuPercent ?? 0) >= 85
                    ? 'text-rose-500'
                    : (snapshot.cpuPercent ?? 0) >= 70
                    ? 'text-amber-500'
                    : 'text-slate-900 dark:text-white'
                )}
                data-testid="telemetry-cpu-value"
              >
                {snapshot.cpuPercent != null ? `${snapshot.cpuPercent}%` : '—'}
              </div>
            </button>

            {/* Memory */}
            <button
              type="button"
              disabled={!memMetricKey}
              onClick={() => handleMetricToggle(memMetricKey)}
              data-testid="telemetry-card-MEMORY"
              className={cn(
                'text-left p-2 rounded-lg border transition-all',
                memMetricKey
                  ? 'cursor-pointer hover:border-violet-400 dark:hover:border-violet-500'
                  : 'cursor-default',
                selectedMetric && selectedMetric === memMetricKey
                  ? 'bg-violet-500/10 border-violet-500 ring-1 ring-violet-500/40'
                  : 'bg-slate-50 dark:bg-[#0b111e] border-slate-200 dark:border-slate-800'
              )}
            >
              <div className="flex items-center justify-between">
                <HardDrive className="w-3 h-3 text-violet-400" />
                {availableMetricUpperSet.has('MEMORY') && (
                  <span className="font-mono text-[7.5px] font-bold px-1 rounded bg-violet-500/15 text-violet-600 dark:text-violet-400">
                    TS
                  </span>
                )}
              </div>
              <div className="font-mono text-[8.5px] text-slate-500 dark:text-slate-400 mt-1">
                RAM
              </div>
              <div
                className="font-mono text-xs font-extrabold text-slate-900 dark:text-white"
                data-testid="telemetry-memory-value"
              >
                {snapshot.memoryPercent != null ? `${snapshot.memoryPercent}%` : '—'}
              </div>
            </button>

            {/* Temperature */}
            <button
              type="button"
              disabled={!tempMetricKey}
              onClick={() => handleMetricToggle(tempMetricKey)}
              data-testid="telemetry-card-TEMPERATURE"
              title={
                tempMetricKey
                  ? isEn
                    ? 'Click to toggle Temperature timeseries chart'
                    : 'Bấm để xem biểu đồ nhiệt độ'
                  : undefined
              }
              className={cn(
                'text-left p-2 rounded-lg border transition-all',
                tempMetricKey
                  ? 'cursor-pointer hover:border-amber-400 dark:hover:border-amber-500'
                  : 'cursor-default',
                selectedMetric && selectedMetric === tempMetricKey
                  ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40'
                  : 'bg-slate-50 dark:bg-[#0b111e] border-slate-200 dark:border-slate-800'
              )}
            >
              <div className="flex items-center justify-between">
                <Thermometer className="w-3 h-3 text-amber-500" />
                {availableMetricUpperSet.has('TEMPERATURE') && (
                  <span className="font-mono text-[7.5px] font-bold px-1 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    TS
                  </span>
                )}
              </div>
              <div className="font-mono text-[8.5px] text-slate-500 dark:text-slate-400 mt-1">
                {isEn ? 'TEMP' : 'NHIỆT ĐỘ'}
              </div>
              <div
                className={cn(
                  'font-mono text-xs font-extrabold',
                  (snapshot.temperatureCelsius ?? 0) >= 65
                    ? 'text-rose-500'
                    : (snapshot.temperatureCelsius ?? 0) >= 50
                    ? 'text-amber-500'
                    : 'text-slate-900 dark:text-white'
                )}
                data-testid="telemetry-temp-value"
              >
                {snapshot.temperatureCelsius != null ? `${snapshot.temperatureCelsius}°C` : '—'}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Extra ingested timeseries metric chips (if any beyond CPU/RAM/Temp/Load) */}
      {extraTimeseriesMetrics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {extraTimeseriesMetrics.map((metric) => {
            const isSelected = selectedMetric === metric
            return (
              <button
                key={metric}
                type="button"
                onClick={() => handleMetricToggle(metric)}
                data-testid={`telemetry-card-${metric}`}
                className={cn(
                  'px-2 py-1 rounded font-mono text-[9.5px] font-bold border transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-50 dark:bg-[#0b111e] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                )}
              >
                {metric} · TS
              </button>
            )
          })}
        </div>
      )}

      {/* 3. Live Telemetry Line Chart Section (Stylebook §5.3) */}
      <div
        className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b111e] border border-slate-200 dark:border-slate-800 space-y-2"
        data-testid="live-telemetry-chart-section"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase flex items-center gap-1.5">
            <LineChartIcon className="w-3 h-3 text-sky-500" />
            {selectedMetric
              ? `LIVE TELEMETRY · ${getMetricDisplayLabel(selectedMetric, isEn).toUpperCase()}`
              : 'LIVE TELEMETRY'}
          </span>

          {selectedMetric && (
            <button
              type="button"
              onClick={() => setSelectedMetric(null)}
              data-testid="telemetry-clear-metric"
              className="font-mono text-[9px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              {isEn ? 'CLEAR' : 'BỎ CHỌN'}
            </button>
          )}
        </div>

        {/* Time Controls: Anchor (mốc thời gian) + Window (khoảng thời gian) */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-slate-200/70 dark:border-slate-800">
          {/* Anchor selector */}
          <div className="inline-flex rounded bg-slate-200/70 dark:bg-slate-900 p-0.5 font-mono text-[8.5px] font-bold">
            <button
              type="button"
              disabled={!snapshot?.collectedAt}
              onClick={() => setTimeAnchor('collected')}
              data-testid="telemetry-anchor-collected"
              className={cn(
                'px-1.5 py-0.5 rounded transition-colors',
                !snapshot?.collectedAt ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                effectiveAnchor === 'collected'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              {isEn ? 'Snapshot' : 'Mốc thu thập'}
            </button>
            <button
              type="button"
              onClick={() => {
                setNowMillis(Date.now())
                setTimeAnchor('now')
              }}
              data-testid="telemetry-anchor-now"
              className={cn(
                'px-1.5 py-0.5 rounded transition-colors cursor-pointer',
                effectiveAnchor === 'now'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              {isEn ? 'Now' : 'Hiện tại'}
            </button>
          </div>

          {/* Window range quick buttons */}
          <div className="inline-flex rounded bg-slate-200/70 dark:bg-slate-900 p-0.5 font-mono text-[8.5px] font-bold">
            {(['15m', '1h', '6h', '24h'] as TimeWindowKey[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setTimeWindow(w)}
                data-testid={`telemetry-window-${w}`}
                className={cn(
                  'px-1.5 py-0.5 rounded transition-colors cursor-pointer',
                  timeWindow === w
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Body */}
        {!selectedMetric ? (
          <div
            className="h-36 flex flex-col items-center justify-center text-center px-3 rounded border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#070a10]/60"
            data-testid="telemetry-chart-empty"
          >
            <LineChartIcon className="w-5 h-5 text-slate-300 dark:text-slate-600 mb-1.5" />
            <p className="font-sans text-[10.5px] text-slate-500 dark:text-slate-400 leading-snug">
              {availableMetrics.length > 0
                ? isEn
                  ? 'Select a TS-badged metric card above (e.g. CPU or Temperature) to plot its live timeseries.'
                  : 'Bấm vào chỉ số có nhãn TS phía trên (như CPU, Nhiệt độ) để vẽ biểu đồ đường.'
                : isEn
                ? 'No timeseries metrics available for this device.'
                : 'Thiết bị này chưa có dữ liệu chuỗi thời gian.'}
            </p>
          </div>
        ) : !mockTelemetry && seriesQuery.isLoading ? (
          <div className="h-36 flex items-center justify-center font-mono text-[10px] text-slate-400">
            {isEn ? 'Loading timeseries...' : 'Đang tải chuỗi thời gian...'}
          </div>
        ) : chartData.length === 0 ? (
          <div
            className="h-36 flex flex-col items-center justify-center text-center px-3 rounded border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#070a10]/60"
            data-testid="telemetry-chart-nodata"
          >
            <p className="font-sans text-[10.5px] text-slate-500 dark:text-slate-400">
              {isEn
                ? `No ${selectedMetric} points recorded in this ${timeWindow} window.`
                : `Không có điểm ${selectedMetric} nào trong khoảng ${timeWindow} đã chọn.`}
            </p>
          </div>
        ) : (
          <div className="h-40 w-full" data-testid="telemetry-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.25)' }}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={38}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: 6,
                    fontSize: 10,
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#f8fafc',
                  }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.fullTime ?? ''}
                  formatter={(value) => [
                    `${value}${activeSeries?.unit ? ` ${activeSeries.unit}` : ''}`,
                    selectedMetric,
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={lineStrokeColor}
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: lineStrokeColor, strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: lineStrokeColor }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 4. Direct Links from Real Canvas Topology */}
      {connectedLinks.length > 0 && (
        <div
          className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0b111e] border border-slate-200 dark:border-slate-800 space-y-1.5"
          data-testid="telemetry-direct-links"
        >
          <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase flex items-center gap-1.5">
            <Network className="w-3 h-3 text-emerald-500" />
            {isEn
              ? `DIRECT LINKS (${connectedLinks.length})`
              : `LIÊN KẾT TRỰC TIẾP (${connectedLinks.length})`}
          </div>

          <div className="space-y-1">
            {connectedLinks.map((link) => {
              const isSource = link.sourceDeviceId === node.id
              const localPort = isSource ? link.sourcePort : link.targetPort
              const peerId = isSource ? link.targetDeviceId : link.sourceDeviceId
              const status = (link.operStatus || 'UP').toUpperCase()
              return (
                <button
                  key={link.linkId}
                  type="button"
                  onClick={() => onSelectLink?.(link)}
                  data-testid={`telemetry-link-${link.linkId}`}
                  className="w-full text-left px-2 py-1.5 rounded bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 font-mono text-[10px] transition-colors cursor-pointer"
                >
                  <div className="min-w-0 truncate text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400">{localPort || 'port'}</span>
                    <span className="mx-1 text-slate-400">⇄</span>
                    <span className="font-bold text-slate-900 dark:text-white">{peerId}</span>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded',
                      status === 'UP'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : status === 'DEGRADED'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-rose-500/10 text-rose-500'
                    )}
                  >
                    {status}
                    {link.capacityGbps ? ` · ${link.capacityGbps}G` : ''}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
