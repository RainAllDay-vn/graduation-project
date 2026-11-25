import React, { useMemo } from 'react'
import { Activity, AlertTriangle, ArrowUpRight, CheckCircle2, Layers, Network, Server } from 'lucide-react'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import { cn } from '@/lib/utils'

export interface NetworkOverviewPanelProps {
  /** All devices currently visible on the topology canvas */
  nodes?: DeviceSummary[]
  /** All links currently visible on the topology canvas */
  links?: LinkSummary[]
  /** Quick jump callback when clicking an attention device */
  onSelectNode?: (node: DeviceSummary) => void
  /** Quick jump callback when clicking an attention link */
  onSelectLink?: (link: LinkSummary) => void
  /** Active display locale */
  locale?: 'vi' | 'en'
  className?: string
}

interface TierBucket {
  id: string
  label: string
  color: string
  total: number
  active: number
  issues: number
}

function getStatusRank(status: string): number {
  const s = status.toUpperCase()
  if (s === 'CRITICAL' || s === 'OFFLINE' || s === 'DOWN') return 0
  if (s === 'DEGRADED' || s === 'WARNING') return 1
  return 2
}

/**
 * Network Health Overview Panel (Right Bar Standard — Default Unselected State)
 *
 * Computes real-time device KPIs, tier distribution, trunk capacity/utilization metrics,
 * and interactive anomaly quick-jumps directly in-memory from canvas nodes and links.
 */
export const NetworkOverviewPanel: React.FC<NetworkOverviewPanelProps> = ({
  nodes = [],
  links = [],
  onSelectNode,
  onSelectLink,
  locale = 'vi',
  className,
}) => {
  const isEn = locale === 'en'

  const stats = useMemo(() => {
    const totalDevices = nodes.length
    let activeDevices = 0
    let degradedDevices = 0
    let criticalDevices = 0
    let totalAccessDevices = 0
    let totalAccessErrors = 0

    const tierMap: Record<'BORDER' | 'CORE' | 'AGG' | 'EXCH', { total: number; active: number; issues: number }> = {
      BORDER: { total: 0, active: 0, issues: 0 },
      CORE: { total: 0, active: 0, issues: 0 },
      AGG: { total: 0, active: 0, issues: 0 },
      EXCH: { total: 0, active: 0, issues: 0 },
    }

    const issueNodes: DeviceSummary[] = []

    for (const node of nodes) {
      const isHealthy = node.status === 'ACTIVE'
      if (isHealthy) {
        activeDevices += 1
      } else if (node.status === 'DEGRADED') {
        degradedDevices += 1
        issueNodes.push(node)
      } else {
        criticalDevices += 1
        issueNodes.push(node)
      }

      totalAccessDevices += node.accessDeviceCount ?? 0
      totalAccessErrors += node.accessErrorCount ?? 0

      let bucketKey: keyof typeof tierMap = 'EXCH'
      if (node.layer === 'PEER' || node.layer === 'IGW') bucketKey = 'BORDER'
      else if (node.layer === 'CORE') bucketKey = 'CORE'
      else if (node.layer === 'AGGREGATION') bucketKey = 'AGG'

      tierMap[bucketKey].total += 1
      if (isHealthy) tierMap[bucketKey].active += 1
      else tierMap[bucketKey].issues += 1
    }

    issueNodes.sort((a, b) => {
      const rankDiff = getStatusRank(a.status) - getStatusRank(b.status)
      return rankDiff !== 0 ? rankDiff : a.id.localeCompare(b.id)
    })

    const availabilityPct =
      totalDevices > 0 ? Math.round((activeDevices / totalDevices) * 1000) / 10 : 0

    const tierBuckets: TierBucket[] = [
      {
        id: 'BORDER',
        label: isEn ? 'BORDER' : 'BIÊN',
        color: '#8b5cf6',
        ...tierMap.BORDER,
      },
      {
        id: 'CORE',
        label: 'CORE',
        color: '#38bdf8',
        ...tierMap.CORE,
      },
      {
        id: 'AGG',
        label: 'AGG',
        color: '#10b981',
        ...tierMap.AGG,
      },
      {
        id: 'EXCH',
        label: 'EXCH',
        color: '#f59e0b',
        ...tierMap.EXCH,
      },
    ]

    // Link & Trunk KPIs
    const totalLinks = links.length
    let upLinks = 0
    let degradedLinks = 0
    let downLinks = 0
    let primaryLinks = 0
    let backupLinks = 0
    let totalCapacityGbps = 0
    let utilSum = 0
    let utilCount = 0
    let peakUtilization = 0
    let congestedLinks = 0

    const issueLinks: LinkSummary[] = []

    for (const link of links) {
      const status = (link.operStatus || 'UP').toUpperCase()
      const util = link.utilizationPercent ?? 0

      if (status === 'UP') upLinks += 1
      else if (status === 'DEGRADED' || status === 'WARNING') degradedLinks += 1
      else downLinks += 1

      if (link.isBackup) backupLinks += 1
      else primaryLinks += 1

      totalCapacityGbps += link.capacityGbps ?? 0

      if (link.utilizationPercent != null && status !== 'DOWN') {
        utilSum += util
        utilCount += 1
        if (util > peakUtilization) peakUtilization = util
        if (util >= 80) congestedLinks += 1
      }

      if (status !== 'UP' || util >= 80) {
        issueLinks.push(link)
      }
    }

    issueLinks.sort((a, b) => {
      const rankDiff = getStatusRank(a.operStatus || 'UP') - getStatusRank(b.operStatus || 'UP')
      if (rankDiff !== 0) return rankDiff
      return (b.utilizationPercent ?? 0) - (a.utilizationPercent ?? 0)
    })

    const avgUtilization = utilCount > 0 ? Math.round(utilSum / utilCount) : 0
    const linkUpPct = totalLinks > 0 ? Math.round((upLinks / totalLinks) * 1000) / 10 : 0

    return {
      totalDevices,
      activeDevices,
      degradedDevices,
      criticalDevices,
      totalAccessDevices,
      totalAccessErrors,
      availabilityPct,
      tierBuckets,
      totalLinks,
      upLinks,
      degradedLinks,
      downLinks,
      primaryLinks,
      backupLinks,
      totalCapacityGbps,
      avgUtilization,
      peakUtilization,
      congestedLinks,
      linkUpPct,
      issueNodes,
      issueLinks,
    }
  }, [nodes, links, isEn])

  const activeBarWidth =
    stats.totalDevices > 0 ? (stats.activeDevices / stats.totalDevices) * 100 : 0
  const degradedBarWidth =
    stats.totalDevices > 0 ? (stats.degradedDevices / stats.totalDevices) * 100 : 0
  const criticalBarWidth =
    stats.totalDevices > 0 ? (stats.criticalDevices / stats.totalDevices) * 100 : 0

  const hasIssues = stats.issueNodes.length > 0 || stats.issueLinks.length > 0

  return (
    <div
      className={cn('flex-1 flex flex-col gap-3.5', className)}
      data-testid="network-overview-panel"
    >
      {/* 1. Section: Device Infrastructure KPIs */}
      <section className="space-y-2" data-testid="overview-device-kpis">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase flex items-center gap-1.5">
            <Server className="w-3 h-3 text-sky-500" />
            {isEn ? 'DEVICE INFRASTRUCTURE' : 'TỔNG QUAN THIẾT BỊ'}
          </span>
          <span
            className={cn(
              'font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded',
              stats.availabilityPct >= 95
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : stats.availabilityPct >= 75
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            )}
            data-testid="overview-availability-pct"
          >
            {stats.totalDevices > 0 ? `${stats.availabilityPct}% UP` : '0%'}
          </span>
        </div>

        {/* Stacked Health Bar */}
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
          {activeBarWidth > 0 && (
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${activeBarWidth}%` }}
              title={`ACTIVE: ${stats.activeDevices}`}
            />
          )}
          {degradedBarWidth > 0 && (
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${degradedBarWidth}%` }}
              title={`DEGRADED: ${stats.degradedDevices}`}
            />
          )}
          {criticalBarWidth > 0 && (
            <div
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${criticalBarWidth}%` }}
              title={`CRITICAL/OFFLINE: ${stats.criticalDevices}`}
            />
          )}
        </div>

        {/* 2x2 KPI Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {isEn ? 'Managed Routers' : 'Tổng thiết bị'}
            </div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span
                className="font-mono font-extrabold text-lg text-slate-900 dark:text-white"
                data-testid="kpi-total-devices"
              >
                {stats.totalDevices}
              </span>
              {stats.totalAccessDevices > 0 && (
                <span className="font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400">
                  +{stats.totalAccessDevices} ACC
                </span>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {isEn ? 'Healthy (Active)' : 'Hoạt động tốt'}
            </div>
            <div
              className="font-mono font-extrabold text-lg text-emerald-600 dark:text-emerald-400 mt-0.5"
              data-testid="kpi-active-devices"
            >
              {stats.activeDevices}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {isEn ? 'Degraded / Warn' : 'Suy hao / Cảnh báo'}
            </div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span
                className={cn(
                  'font-mono font-extrabold text-lg',
                  stats.degradedDevices > 0
                    ? 'text-amber-500'
                    : 'text-slate-400 dark:text-slate-500'
                )}
                data-testid="kpi-degraded-devices"
              >
                {stats.degradedDevices}
              </span>
              {stats.totalAccessErrors > 0 && (
                <span className="font-mono text-[9px] font-bold text-amber-500">
                  {stats.totalAccessErrors} ACC err
                </span>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {isEn ? 'Critical / Down' : 'Nghiêm trọng'}
            </div>
            <div
              className={cn(
                'font-mono font-extrabold text-lg mt-0.5',
                stats.criticalDevices > 0
                  ? 'text-rose-500'
                  : 'text-slate-400 dark:text-slate-500'
              )}
              data-testid="kpi-critical-devices"
            >
              {stats.criticalDevices}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Section: Layer Distribution */}
      <section className="space-y-1.5" data-testid="overview-tier-breakdown">
        <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-indigo-400" />
          {isEn ? 'LAYER DISTRIBUTION' : 'PHÂN BỔ THEO TẦNG'}
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
          {stats.tierBuckets.map((tier) => {
            const pct = tier.total > 0 ? Math.round((tier.active / tier.total) * 100) : 0
            return (
              <div key={tier.id} className="space-y-1" data-testid={`tier-stat-${tier.id}`}>
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: tier.color }}
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {tier.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tier.issues > 0 && (
                      <span className="text-[9px] font-bold text-rose-500">
                        {tier.issues} {isEn ? 'err' : 'lỗi'}
                      </span>
                    )}
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {tier.active}/{tier.total}
                    </span>
                  </div>
                </div>
                <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-slate-700/70 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      tier.total === 0
                        ? 'bg-transparent'
                        : tier.issues > 0
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. Section: Trunk Links & Bandwidth KPIs */}
      <section className="space-y-2" data-testid="overview-trunk-kpis">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase flex items-center gap-1.5">
            <Network className="w-3 h-3 text-emerald-500" />
            {isEn ? 'TRUNK LINKS & CAPACITY' : 'ĐƯỜNG TRỤC & BĂNG THÔNG'}
          </span>
          <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {stats.totalLinks > 0 ? `${stats.linkUpPct}% UP` : '0%'}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 space-y-2.5 font-mono">
          {/* Status Breakdown Row */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/70">
            <div>
              <div className="font-sans text-[10px] text-slate-500 dark:text-slate-400">
                {isEn ? 'Total Links' : 'Tổng đường trục'}
              </div>
              <div
                className="text-base font-extrabold text-slate-900 dark:text-white"
                data-testid="kpi-total-links"
              >
                {stats.totalLinks}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {stats.upLinks} UP
              </span>
              {stats.degradedLinks > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {stats.degradedLinks} DEG
                </span>
              )}
              {stats.downLinks > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  {stats.downLinks} DOWN
                </span>
              )}
            </div>
          </div>

          {/* Capacity & Redundancy Grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10.5px]">
            <div>
              <div className="text-[9.5px] font-sans text-slate-500 dark:text-slate-400">
                {isEn ? 'Total Capacity' : 'Tổng dung lượng'}
              </div>
              <div
                className="font-bold text-slate-900 dark:text-slate-100"
                data-testid="kpi-total-capacity"
              >
                {stats.totalCapacityGbps.toLocaleString()} Gbps
              </div>
            </div>

            <div>
              <div className="text-[9.5px] font-sans text-slate-500 dark:text-slate-400">
                {isEn ? 'Primary / Backup' : 'Chính / Dự phòng'}
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100">
                {stats.primaryLinks} <span className="text-slate-400 font-normal">/</span>{' '}
                <span className="text-sky-600 dark:text-sky-400">{stats.backupLinks}</span>
              </div>
            </div>

            <div>
              <div className="text-[9.5px] font-sans text-slate-500 dark:text-slate-400">
                {isEn ? 'Avg Utilization' : 'Tải trung bình'}
              </div>
              <div
                className={cn(
                  'font-bold',
                  stats.avgUtilization >= 80
                    ? 'text-rose-500'
                    : stats.avgUtilization >= 50
                    ? 'text-amber-500'
                    : 'text-emerald-600 dark:text-emerald-400'
                )}
              >
                {stats.avgUtilization}%
              </div>
            </div>

            <div>
              <div className="text-[9.5px] font-sans text-slate-500 dark:text-slate-400">
                {isEn ? 'Peak / Congested' : 'Tải đỉnh / Nghẽn'}
              </div>
              <div className="font-bold flex items-center gap-1">
                <span
                  className={cn(
                    stats.peakUtilization >= 80
                      ? 'text-rose-500'
                      : stats.peakUtilization >= 50
                      ? 'text-amber-500'
                      : 'text-emerald-600 dark:text-emerald-400'
                  )}
                >
                  {stats.peakUtilization}%
                </span>
                {stats.congestedLinks > 0 && (
                  <span className="text-[9px] text-rose-500 font-bold">
                    ({stats.congestedLinks} ≥80%)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section: Attention Items / Quick Jump */}
      <section className="space-y-1.5" data-testid="overview-attention-section">
        <div className="font-mono text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-[#64748b] uppercase flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-amber-500" />
          {isEn ? 'ATTENTION REQUIRED' : 'ĐIỂM NÓNG CẦN CHÚ Ý'}
        </div>

        {!hasIssues ? (
          <div className="p-2.5 rounded-lg border border-emerald-500/25 bg-emerald-500/5 flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-300 font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {stats.totalDevices === 0
                ? isEn
                  ? 'No topology nodes loaded.'
                  : 'Chưa có dữ liệu thiết bị trên bản đồ.'
                : isEn
                ? 'All routers and trunk links are operating nominally.'
                : 'Toàn bộ router và đường trục đều vận hành ổn định.'}
            </span>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar pr-0.5">
            {stats.issueNodes.map((node) => {
              const isCrit = node.status === 'CRITICAL' || node.status === 'OFFLINE'
              return (
                <button
                  key={`issue-node-${node.id}`}
                  type="button"
                  data-testid={`attention-node-${node.id}`}
                  onClick={() => onSelectNode?.(node)}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded-lg border transition-colors flex items-center justify-between gap-2 cursor-pointer group',
                    isCrit
                      ? 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/25'
                      : 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/25'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle
                      className={cn(
                        'w-3.5 h-3.5 shrink-0',
                        isCrit ? 'text-rose-500' : 'text-amber-500'
                      )}
                    />
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                        {node.id}
                      </div>
                      <div className="font-mono text-[9px] text-slate-500 dark:text-slate-400 truncate">
                        {node.layer} · {node.site}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={cn(
                        'font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase',
                        isCrit
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {node.status}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                  </div>
                </button>
              )
            })}

            {stats.issueLinks.map((link) => {
              const status = (link.operStatus || 'UP').toUpperCase()
              const isDown = status === 'DOWN'
              const isHighUtil = status === 'UP' && (link.utilizationPercent ?? 0) >= 80
              return (
                <button
                  key={`issue-link-${link.linkId}`}
                  type="button"
                  data-testid={`attention-link-${link.linkId}`}
                  onClick={() => onSelectLink?.(link)}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded-lg border transition-colors flex items-center justify-between gap-2 cursor-pointer group',
                    isDown
                      ? 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/25'
                      : 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/25'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Network
                      className={cn(
                        'w-3.5 h-3.5 shrink-0',
                        isDown ? 'text-rose-500' : 'text-amber-500'
                      )}
                    />
                    <div className="min-w-0">
                      <div className="font-mono text-[10.5px] font-bold text-slate-900 dark:text-slate-100 truncate">
                        {link.sourceDeviceId} ⇄ {link.targetDeviceId}
                      </div>
                      <div className="font-mono text-[9px] text-slate-500 dark:text-slate-400 truncate">
                        {link.linkId} · {link.capacityGbps ?? 100}G
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={cn(
                        'font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase',
                        isDown
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {isHighUtil ? `${link.utilizationPercent}%` : status}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* 5. Footer Usage Hint */}
      <div className="mt-auto p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
        💡 <strong>{isEn ? 'Usage Hint:' : 'Hướng dẫn:'}</strong>{' '}
        {isEn
          ? 'Click any router or link on the canvas to inspect its hardware details. Double-click a node to toggle its radar beacon.'
          : 'Bấm đơn vào router hoặc đường trục để xem chi tiết. Bấm đúp vào router để bật/tắt vòng radar beacon.'}
      </div>
    </div>
  )
}
