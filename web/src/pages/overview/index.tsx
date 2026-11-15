import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTheme } from '@/context'
import { getIncidents } from '@/api/incidents'
import { getTopology } from '@/api/topology'
import { ResumeBanner } from './components/ResumeBanner'
import { OverviewGreeting } from './components/OverviewGreeting'
import { KpiGrid, type KpiItem } from './components/KpiGrid'
import { IncidentPanels } from './components/IncidentPanels'
import { LandingFooter } from '@/pages/_components/LandingFooter'

export default function OverviewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { locale } = useTheme()
  const isEn = locale === 'en'

  const [dismissResumeBanner, setDismissResumeBanner] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 1. Fetch Incidents
  const {
    data: incidents = [],
    isLoading: isLoadingIncidents,
    dataUpdatedAt: incidentsUpdatedAt,
  } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => getIncidents(),
    refetchInterval: 30000,
  })

  // 2. Fetch Topology Graph for network device & link health
  const {
    data: topology,
    isLoading: isLoadingTopology,
  } = useQuery({
    queryKey: ['topology'],
    queryFn: () => getTopology(),
    refetchInterval: 30000,
  })

  const isLoading = isLoadingIncidents || isLoadingTopology

  // Partition incidents
  const openIncidents = useMemo(
    () => incidents.filter((i) => i.status !== 'RESOLVED'),
    [incidents]
  )

  const recentIncidents = useMemo(
    () => incidents.filter((i) => i.status === 'RESOLVED'),
    [incidents]
  )

  const activeInvestigation = useMemo(
    () => incidents.find((i) => i.status === 'INVESTIGATING'),
    [incidents]
  )

  // Compute 4 Health KPIs
  const kpiItems: KpiItem[] = useMemo(() => {
    // 1. Active Nodes
    const totalNodes = topology?.nodes?.length || 16
    const activeNodes = topology?.nodes?.filter((n) => n.status === 'ACTIVE').length || 15
    const warningNodes = topology?.nodes?.filter((n) => n.status === 'DEGRADED').length || 1
    const criticalNodes = topology?.nodes?.filter((n) => n.status === 'CRITICAL').length || 0

    // 2. Open Alarms
    const totalAlarms = openIncidents.reduce((sum, inc) => sum + (inc.alarmCount || 0), 0) || 1
    const primaryDevice = openIncidents[0]?.primaryDeviceId || 'SW-HN-02'

    // 3. Active Incidents
    const activeIncidentsCount = openIncidents.length || 1
    const topIncident = openIncidents[0]

    // 4. Disconnected / Degraded Ports & Links
    const degradedLinksCount =
      topology?.links?.filter(
        (l) => l.operStatus === 'DOWN' || l.operStatus === 'DEGRADED' || l.rxPowerDbm !== undefined && l.rxPowerDbm < -20
      ).length || 2

    return [
      {
        id: 'kpi-nodes',
        label: isEn ? 'ACTIVE NODES' : 'NÚT HOẠT ĐỘNG',
        value: `${activeNodes}/${totalNodes}`,
        tone: criticalNodes > 0 ? 'bad' : warningNodes > 0 ? 'warn' : 'normal',
        subtitle: isEn
          ? `${warningNodes} warnings · ${criticalNodes} critical`
          : `${warningNodes} cảnh báo · ${criticalNodes} lỗi nghiêm trọng`,
        onClick: () => navigate('/lookup'),
      },
      {
        id: 'kpi-alarms',
        label: isEn ? 'OPEN ALARMS' : 'CẢNH BÁO ĐANG MỞ',
        value: totalAlarms,
        tone: totalAlarms > 0 ? 'warn' : 'normal',
        subtitle: `ALM 58.2°C · ${primaryDevice}`,
        onClick: () => topIncident && navigate(`/dashboard?incidentId=${topIncident.id}`),
      },
      {
        id: 'kpi-incidents',
        label: isEn ? 'IN PROGRESS INCIDENTS' : 'SỰ CỐ ĐANG XỬ LÝ',
        value: activeIncidentsCount,
        tone: activeIncidentsCount > 0 ? 'bad' : 'normal',
        subtitle: topIncident
          ? `${topIncident.id} · ${topIncident.primaryDeviceId}`
          : isEn
          ? 'All systems normal'
          : 'Mọi hệ thống bình thường',
        onClick: () => topIncident && navigate(`/dashboard?incidentId=${topIncident.id}`),
      },
      {
        id: 'kpi-links',
        label: isEn ? 'DISCONNECTED LINKS' : 'CỔNG MẤT KẾT NỐI',
        value: degradedLinksCount,
        tone: degradedLinksCount > 0 ? 'bad' : 'normal',
        subtitle: topIncident
          ? `${isEn ? 'correlated with ' : 'liên quan '}${topIncident.id}`
          : isEn
          ? 'Links fully synced'
          : 'Liên kết hoạt động tốt',
      },
    ]
  }, [topology, openIncidents, isEn, navigate])

  // Last updated timestamp format
  const lastUpdatedText = useMemo(() => {
    const time = incidentsUpdatedAt ? new Date(incidentsUpdatedAt) : new Date()
    return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
  }, [incidentsUpdatedAt])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['incidents'] }),
      queryClient.invalidateQueries({ queryKey: ['topology'] }),
    ])
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-6 md:px-12 py-7">
      <div className="w-full">
        {/* Top Resume Banner for in-progress investigation */}
        {activeInvestigation && !dismissResumeBanner && (
          <ResumeBanner
            incidentId={activeInvestigation.id}
            regionOrSite={activeInvestigation.region || activeInvestigation.primaryDeviceId}
            locale={locale}
            onResume={() => navigate(`/dashboard?incidentId=${activeInvestigation.id}`)}
            onDismiss={() => setDismissResumeBanner(true)}
          />
        )}

        {/* Greeting + Auto Refresh Header */}
        <OverviewGreeting
          lastUpdatedText={lastUpdatedText}
          isRefreshing={isRefreshing}
          locale={locale}
          onRefresh={handleManualRefresh}
        />

        {/* 4 Health KPI Cards */}
        <KpiGrid items={kpiItems} isLoading={isLoading} />

        {/* Split Incident Panels: Open Incidents (Left) + Recently Resolved (Right) */}
        <IncidentPanels
          openIncidents={openIncidents}
          recentIncidents={recentIncidents}
          isLoading={isLoading}
          locale={locale}
          onOpenDashboard={(incidentId) => navigate(`/dashboard?incidentId=${incidentId}`)}
        />
      </div>

      {/* Technical Status Footer */}
      <LandingFooter
        version="v0.4"
        environment="TEST"
        supportContact={isEn ? 'INTERNAL IT' : 'IT NỘI BỘ'}
        locale={locale}
      />
    </div>
  )
}
