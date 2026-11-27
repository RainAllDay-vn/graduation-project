import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTheme, useSettings } from '@/context'
import { getOverview, type OverviewData } from '@/api/overview'
import { ResumeBanner } from './components/ResumeBanner'
import { OverviewGreeting } from './components/OverviewGreeting'
import { KpiGrid, type KpiItem } from './components/KpiGrid'
import { IncidentPanels } from './components/IncidentPanels'
import { LandingFooter } from '@/pages/_components/LandingFooter'

export default function OverviewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { locale } = useTheme()
  const { settings } = useSettings()
  const isEn = locale === 'en'

  const [dismissResumeBanner, setDismissResumeBanner] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const {
    data: overview,
    isLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['overview'],
    queryFn: () => getOverview(),
    refetchInterval: 5000,
  })

  const metrics = overview?.metrics
  const topIncident = overview?.topIncident ?? null
  const openIncidents = useMemo(() => overview?.openIncidents ?? [], [overview])
  const recentIncidents = useMemo(() => overview?.recentlyResolved ?? [], [overview])

  const activeInvestigation = useMemo(
    () => openIncidents.find((i) => i.status === 'INVESTIGATING'),
    [openIncidents]
  )

  const kpiItems: KpiItem[] = useMemo(() => {
    const m: OverviewData['metrics'] = metrics ?? {
      nodesUp: 0,
      nodesTotal: 0,
      nodesWarning: 0,
      nodesCritical: 0,
      openAlarms: 0,
      openIncidents: 0,
      portsDown: 0,
    }
    const primaryDevice = topIncident?.primaryDeviceId || ''

    return [
      {
        id: 'kpi-nodes',
        label: isEn ? 'ACTIVE NODES' : 'NÚT HOẠT ĐỘNG',
        value: `${m.nodesUp}/${m.nodesTotal}`,
        tone: m.nodesCritical > 0 ? 'bad' : m.nodesWarning > 0 ? 'warn' : 'normal',
        subtitle: isEn
          ? `${m.nodesWarning} warnings · ${m.nodesCritical} critical`
          : `${m.nodesWarning} cảnh báo · ${m.nodesCritical} lỗi nghiêm trọng`,
        onClick: () => navigate('/lookup'),
      },
      {
        id: 'kpi-alarms',
        label: isEn ? 'OPEN ALARMS' : 'CẢNH BÁO ĐANG MỞ',
        value: m.openAlarms,
        tone: m.openAlarms > 0 ? 'warn' : 'normal',
        subtitle: m.openAlarms > 0
          ? primaryDevice
            ? `${m.openAlarms} ${isEn ? 'active' : 'hoạt động'} · ${primaryDevice}`
            : `${m.openAlarms} ${isEn ? 'active alarms' : 'cảnh báo hoạt động'}`
          : isEn
          ? 'All systems nominal'
          : 'Tất cả bình thường',
        onClick: () => topIncident && navigate(`/dashboard?incidentId=${topIncident.id}`),
      },
      {
        id: 'kpi-incidents',
        label: isEn ? 'IN PROGRESS INCIDENTS' : 'SỰ CỐ ĐANG XỬ LÝ',
        value: m.openIncidents,
        tone: m.openIncidents > 0 ? 'bad' : 'normal',
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
        value: m.portsDown,
        tone: m.portsDown > 0 ? 'bad' : 'normal',
        subtitle: topIncident
          ? `${isEn ? 'correlated with ' : 'liên quan '}${topIncident.id}`
          : isEn
          ? 'Links fully synced'
          : 'Liên kết hoạt động tốt',
      },
    ]
  }, [metrics, topIncident, isEn, navigate])

  const lastUpdatedText = useMemo(() => {
    const time = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date()
    return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
  }, [dataUpdatedAt])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['overview'] })
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-6 md:px-12 py-7">
      <div className="w-full">
        {/* Top Resume Banner for in-progress investigation (controlled by settings) */}
        {activeInvestigation && settings.promptResumeInvestigation && !dismissResumeBanner && (
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
