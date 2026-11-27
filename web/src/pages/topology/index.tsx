import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import type { BlastRadiusReport, DeviceSummary, LinkSummary } from '@/api/topology'
import { getBlastRadius, getSubgraph, getTopology } from '@/api/topology'
import {
  getIncidentById,
  updateIncidentStatus,
  type AlarmSummary,
  type IncidentDetails,
} from '@/api/incidents'
import {
  getHypotheses,
  getHypothesisById,
  updateHypothesisStatus,
  type HypothesisDetails,
  type HypothesisSummary,
  type UpdateHypothesisStatusPayload,
} from '@/api/hypotheses'
import { useTheme } from '@/context'
import {
  TopologyCanvas,
  type TopologyCanvasHandle,
  TopologyHeader,
  TopologyLeftSidebar,
  TopologyRightSidebar,
} from './components'
import { type DisplaySettings, DEFAULT_DISPLAY_SETTINGS } from './components/sidebar'
import type { KHopDistance, KHopFilterMode } from './components/canvas/egoNetwork'

export interface TopologyPageProps {
  /** Optional override for active incident ID */
  initialIncidentId?: string | null
  /** Optional override for focused router ID */
  initialFocusNodeId?: string | null
  /** Optional mocked dataset for Storybook or standalone testing */
  mockData?: {
    nodes: DeviceSummary[]
    links: LinkSummary[]
  }
  /** Optional mocked incident details strictly for Storybook/tests */
  mockIncident?: IncidentDetails | null
  /** Optional mocked blast radius report strictly for Storybook/tests */
  mockBlastRadius?: BlastRadiusReport | null
  /** Optional mocked hypotheses strictly for Storybook/tests */
  mockHypotheses?: HypothesisSummary[]
}

export const TopologyPage: React.FC<TopologyPageProps> = ({
  initialIncidentId,
  initialFocusNodeId,
  mockData,
  mockIncident,
  mockBlastRadius,
  mockHypotheses,
}) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { locale } = useTheme()

  // 1. Resolve URL search parameters vs props
  const incidentId = initialIncidentId !== undefined
    ? initialIncidentId
    : searchParams.get('incidentId')

  const focusNodeId = initialFocusNodeId !== undefined
    ? initialFocusNodeId
    : searchParams.get('focusNodeId')

  const kHopParam = searchParams.get('kHop')
  const kHop = kHopParam
    ? kHopParam === 'all'
      ? undefined
      : parseInt(kHopParam, 10)
    : undefined

  // 2. Fetch topology subgraph or hub-centered topology graph (starting points are mandatory server-side)
  const {
    data: remoteData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['topology', 'graph', focusNodeId, incidentId, kHop],
    queryFn: () => {
      if (focusNodeId || incidentId) {
        return getSubgraph({
          focusNodeId: focusNodeId || undefined,
          incidentId: incidentId || undefined,
          kHop,
        })
      }
      return getTopology({ focusLayer: 'CORE' })
    },
    enabled: !mockData,
    staleTime: 30000,
  })

  // 2b. Fetch active incident details & blast radius in Incident Mode (Step 3.1 / §5.6)
  const incidentQuery = useQuery({
    queryKey: ['incident', 'detail', incidentId],
    queryFn: () => getIncidentById(incidentId as string),
    enabled: Boolean(incidentId && !mockData && !mockIncident),
    staleTime: 30000,
  })

  const incidentData = mockIncident ?? incidentQuery.data ?? null

  const blastRadiusQuery = useQuery({
    queryKey: ['topology', 'blast-radius', incidentData?.primaryDeviceId],
    queryFn: () => getBlastRadius(incidentData!.primaryDeviceId),
    enabled: Boolean(incidentId && incidentData?.primaryDeviceId && !mockData && !mockBlastRadius),
    staleTime: 30000,
  })

  const blastRadiusReport = mockBlastRadius ?? blastRadiusQuery.data ?? null

  // 2c. Fetch AI hypotheses & details for active incident (Step 3.3 / §4.3)
  const hypothesesQuery = useQuery({
    queryKey: ['hypotheses', incidentId],
    queryFn: () => getHypotheses(incidentId as string),
    enabled: Boolean(incidentId && !mockData && !mockHypotheses),
    staleTime: 30000,
  })

  const hypotheses = useMemo(
    () => mockHypotheses ?? hypothesesQuery.data ?? [],
    [mockHypotheses, hypothesesQuery.data]
  )

  const [expandedHypothesisId, setExpandedHypothesisId] = useState<number | null>(null)

  const hypothesisDetailQuery = useQuery({
    queryKey: ['hypothesis', 'detail', incidentId, expandedHypothesisId],
    queryFn: () => getHypothesisById(incidentId as string, expandedHypothesisId as number),
    enabled: Boolean(incidentId && expandedHypothesisId != null && !mockData && !mockHypotheses),
    staleTime: 30000,
  })

  const rejectedHypothesisIds = useMemo(
    () => hypotheses.filter((h) => h.status === 'REJECTED').map((h) => h.id),
    [hypotheses]
  )

  const rejectedDetailQueries = useQueries({
    queries: rejectedHypothesisIds.map((id) => ({
      queryKey: ['hypothesis', 'detail', incidentId, id],
      queryFn: () => getHypothesisById(incidentId as string, id),
      enabled: Boolean(incidentId && !mockData && !mockHypotheses),
      staleTime: 30000,
    })),
  })

  const hypothesisDetailsById = useMemo(() => {
    const map: Record<number, HypothesisDetails> = {}
    if (hypothesisDetailQuery.data) {
      map[hypothesisDetailQuery.data.id] = hypothesisDetailQuery.data
    }
    rejectedDetailQueries.forEach((q) => {
      if (q.data) {
        map[q.data.id] = q.data
      }
    })
    return map
  }, [hypothesisDetailQuery.data, rejectedDetailQueries])

  const updateHypothesisMutation = useMutation({
    mutationFn: ({
      hypothesisId,
      payload,
    }: {
      hypothesisId: number
      payload: UpdateHypothesisStatusPayload
    }) => updateHypothesisStatus(incidentId as string, hypothesisId, payload),
    onSuccess: async (updatedDetails, variables) => {
      if (!incidentId) return
      queryClient.setQueryData(
        ['hypothesis', 'detail', incidentId, variables.hypothesisId],
        updatedDetails
      )
      queryClient.setQueryData<HypothesisSummary[]>(
        ['hypotheses', incidentId],
        (prev) =>
          prev?.map((item) =>
            item.id === variables.hypothesisId
              ? { ...item, status: updatedDetails.status }
              : item
          ) ?? []
      )
      queryClient.invalidateQueries({ queryKey: ['hypotheses', incidentId] })

      if (
        variables.payload.status === 'CONFIRMED' &&
        incidentData &&
        (incidentData.status === 'OPEN' || incidentData.status === 'PRIORITIZED')
      ) {
        await updateIncidentStatus(incidentId, 'INVESTIGATING')
        queryClient.invalidateQueries({ queryKey: ['incident', 'detail', incidentId] })
        queryClient.invalidateQueries({ queryKey: ['overview'] })
        queryClient.invalidateQueries({ queryKey: ['incidents', 'badge'] })
      }
    },
  })

  // Use provided mockData strictly for Storybook/tests; otherwise use remoteData from API
  const nodes = useMemo(() => {
    if (mockData) return mockData.nodes
    return remoteData?.nodes ?? []
  }, [mockData, remoteData])

  const links = useMemo(() => {
    if (mockData) return mockData.links
    return remoteData?.links ?? []
  }, [mockData, remoteData])

  // 3. Selection & Inspection State (Stylebook §3.5)
  // Single click: Selected device or link that controls the Inspector (Chapter 5)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)
  const [selectedAlarmId, setSelectedAlarmId] = useState<string | null>(null)
  const [selectedFaultCode, setSelectedFaultCode] = useState<string | null>(null)
  const canvasRef = useRef<TopologyCanvasHandle>(null)
  const autoPannedIncidentRef = useRef<string | null>(null)

  // Double click: Set of active beacon focus nodes (Stylebook §3.5: multiple beacons)
  const [focusedNodeIds, setFocusedNodeIds] = useState<Set<string>>(() => {
    const s = new Set<string>()
    if (focusNodeId) s.add(focusNodeId)
    return s
  })
  const [dismissedEpicenterKey, setDismissedEpicenterKey] = useState<string | null>(null)
  const lastPannedHypothesisRef = useRef<string | null>(null)

  const incidentPrimaryDeviceId = incidentData?.primaryDeviceId
  const currentEpicenterKey =
    incidentId && incidentPrimaryDeviceId
      ? `${incidentId}:${incidentPrimaryDeviceId}`
      : null

  const expandedHypothesisDetails =
    expandedHypothesisId != null ? hypothesisDetailsById[expandedHypothesisId] ?? null : null

  const hypothesisFocusNodeIds = useMemo(() => {
    if (!incidentId || !expandedHypothesisDetails) return []
    const candidates = [
      expandedHypothesisDetails.sourceNode,
      expandedHypothesisDetails.targetNode,
      expandedHypothesisDetails.targetType === 'NODE'
        ? expandedHypothesisDetails.targetId
        : null,
    ].filter((id): id is string => Boolean(id))

    return Array.from(new Set(candidates)).filter((id) =>
      nodes.some((n) => n.id === id)
    )
  }, [incidentId, expandedHypothesisDetails, nodes])

  const effectiveFocusedNodeIds = useMemo(() => {
    const next = new Set(focusedNodeIds)
    if (hypothesisFocusNodeIds.length > 0) {
      hypothesisFocusNodeIds.forEach((id) => next.add(id))
    } else if (
      incidentId &&
      incidentPrimaryDeviceId &&
      dismissedEpicenterKey !== currentEpicenterKey
    ) {
      next.add(incidentPrimaryDeviceId)
    }
    return next
  }, [
    focusedNodeIds,
    hypothesisFocusNodeIds,
    incidentId,
    incidentPrimaryDeviceId,
    dismissedEpicenterKey,
    currentEpicenterKey,
  ])

  useEffect(() => {
    if (expandedHypothesisId == null || hypothesisFocusNodeIds.length === 0) return
    const panKey = `${expandedHypothesisId}:${hypothesisFocusNodeIds.join(',')}`
    if (lastPannedHypothesisRef.current === panKey) return
    lastPannedHypothesisRef.current = panKey
    canvasRef.current?.panToNode(hypothesisFocusNodeIds[0])
  }, [expandedHypothesisId, hypothesisFocusNodeIds])

  // Auto-pan canvas once to incident epicenter when incident details & graph load (Step 3.1)
  useEffect(() => {
    const epicenterId = incidentData?.primaryDeviceId
    if (!incidentId || !epicenterId || nodes.length === 0) return
    const panKey = `${incidentId}:${epicenterId}`
    if (autoPannedIncidentRef.current === panKey) return
    if (!nodes.some((n) => n.id === epicenterId)) return

    const timer = window.setTimeout(() => {
      canvasRef.current?.panToNode(epicenterId)
      autoPannedIncidentRef.current = panKey
    }, 80)

    return () => window.clearTimeout(timer)
  }, [incidentId, incidentData?.primaryDeviceId, nodes])
  const [currentKHop, setCurrentKHop] = useState<KHopDistance>(() => {
    const p = searchParams.get('kHop')
    if (p === '1' || p === '2' || p === '3') {
      return parseInt(p, 10) as KHopDistance
    }
    return 'all'
  })
  const [currentFilterMode, setCurrentFilterMode] = useState<KHopFilterMode>('ghost')

  // Visual display toggles (Tab Hiển thị: Tier bands, centerlines, counts, port labels)
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(DEFAULT_DISPLAY_SETTINGS)

  const handleDisplaySettingChange = <K extends keyof DisplaySettings>(
    key: K,
    value: DisplaySettings[K]
  ) => {
    setDisplaySettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetDisplaySettings = () => {
    setDisplaySettings(DEFAULT_DISPLAY_SETTINGS)
    setCurrentKHop('all')
    setCurrentFilterMode('ghost')
  }

  const selectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null),
    [selectedNodeId, nodes]
  )

  const selectedLink = useMemo(
    () => (selectedLinkId ? links.find((l) => l.linkId === selectedLinkId) ?? null : null),
    [selectedLinkId, links]
  )

  // Incident blast radius affected links from BlastRadiusReport API (Step 3.1 / §5.6)
  const blastRadiusLinkIds = useMemo(() => {
    if (!incidentId || !blastRadiusReport?.affectedLinkIds?.length) return undefined
    return blastRadiusReport.affectedLinkIds
  }, [incidentId, blastRadiusReport])

  const incidentAlarms = useMemo(
    () => incidentData?.alarms ?? [],
    [incidentData]
  )

  const confirmedHypothesis = useMemo(
    () => hypotheses.find((h) => h.status === 'CONFIRMED') ?? null,
    [hypotheses]
  )

  // Toggle hypothesis accordion without altering Right Inspector selection (§4.3)
  const handleToggleHypothesis = (hypothesis: HypothesisSummary) => {
    setExpandedHypothesisId((prev) => {
      const next = prev === hypothesis.id ? null : hypothesis.id
      if (next === null) {
        lastPannedHypothesisRef.current = null
      }
      return next
    })
  }

  const handleUpdateHypothesisStatus = async (
    hypothesisId: number,
    payload: UpdateHypothesisStatusPayload
  ) => {
    if (!incidentId) return
    await updateHypothesisMutation.mutateAsync({ hypothesisId, payload })
  }

  // Single click: Only updates selection and inspector context (Stylebook §3.5: "không đụng beacon")
  const handleSelectNode = (node: DeviceSummary) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id))
    setSelectedLinkId(null)
    setSelectedAlarmId(null)
  }

  // Device selection from Left Sidebar directory: updates selection in inspector and pans canvas to center node
  const handleSelectDeviceFromSidebar = (device: DeviceSummary) => {
    setSelectedNodeId(device.id)
    setSelectedLinkId(null)
    setSelectedAlarmId(null)
    canvasRef.current?.panToNode(device.id)
  }

  // Timeline alarm row click (§4.2): center & focus alarm.deviceId + open Node Inspector
  const handleSelectAlarmFromTimeline = (alarm: AlarmSummary) => {
    setSelectedAlarmId(alarm.id)
    setSelectedNodeId(alarm.deviceId)
    setSelectedLinkId(null)

    if (
      incidentId &&
      incidentPrimaryDeviceId === alarm.deviceId &&
      currentEpicenterKey
    ) {
      setDismissedEpicenterKey(null)
    }

    setFocusedNodeIds((prev) => {
      const next = new Set(prev)
      next.add(alarm.deviceId)
      return next
    })

    canvasRef.current?.panToNode(alarm.deviceId)
  }

  // Fault code badge click (§4.2 -> connects to FaultDocDrawer in Step 3.4b)
  const handleSelectFaultCode = (faultCode: string, alarm: AlarmSummary) => {
    setSelectedFaultCode(faultCode)
    handleSelectAlarmFromTimeline(alarm)
  }

  // Double click: Toggles beacon focus on / off (Stylebook §3.5: "Bấm đúp một node → beacon... Bấm đúp lại → biến mất")
  const handleFocusNode = (node: DeviceSummary) => {
    if (
      incidentId &&
      incidentData?.primaryDeviceId === node.id &&
      currentEpicenterKey
    ) {
      if (effectiveFocusedNodeIds.has(node.id)) {
        setDismissedEpicenterKey(currentEpicenterKey)
        setFocusedNodeIds((prev) => {
          const next = new Set(prev)
          next.delete(node.id)
          return next
        })
      } else {
        setDismissedEpicenterKey(null)
      }
      return
    }

    setFocusedNodeIds((prev) => {
      const next = new Set(prev)
      if (next.has(node.id)) {
        next.delete(node.id)
      } else {
        next.add(node.id)
      }
      return next
    })
  }

  const handleClearFocus = () => {
    setFocusedNodeIds(new Set())
    if (currentEpicenterKey) {
      setDismissedEpicenterKey(currentEpicenterKey)
    }
  }

  const handleSelectLink = (link: LinkSummary) => {
    setSelectedLinkId((prev) => (prev === link.linkId ? null : link.linkId))
    setSelectedNodeId(null)
  }

  const handleCloseInspect = () => {
    setSelectedNodeId(null)
    setSelectedLinkId(null)
    setSelectedAlarmId(null)
  }

  return (
    <div
      className="w-full h-full flex flex-col bg-[#f8fafc] dark:bg-[#070a10] text-[#0f172a] dark:text-[#f8fafc] overflow-hidden select-none"
      data-testid="topology-page"
      data-active-fault-code={selectedFaultCode || undefined}
    >
      {/* 1. Contextual Thin Top Header (Stylebook §0.1) */}
      <TopologyHeader
        incidentId={incidentId}
        incidentTitle={incidentData?.title}
        incidentStatus={incidentData?.status}
        confirmedHypothesisLabel={
          confirmedHypothesis ? confirmedHypothesis.shortTitle || confirmedHypothesis.title : null
        }
        onExitIncident={incidentId ? () => navigate('/topology') : undefined}
        totalNodes={nodes.length}
        totalLinks={links.length}
        focusNodeId={
          effectiveFocusedNodeIds.size === 1
            ? Array.from(effectiveFocusedNodeIds)[0]
            : effectiveFocusedNodeIds.size > 1
              ? `${effectiveFocusedNodeIds.size} TIÊU ĐIỂM`
              : null
        }
        focusHop={currentKHop}
        locale={locale}
      />

      {/* 2. 3-Column Workspace Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Sidebar: Navigation & Directory */}
        <TopologyLeftSidebar
          incidentId={incidentId}
          alarms={incidentAlarms}
          isLoadingAlarms={Boolean(incidentId && !mockData && !mockIncident && incidentQuery.isLoading)}
          selectedAlarmId={selectedAlarmId}
          onSelectAlarm={handleSelectAlarmFromTimeline}
          onSelectFaultCode={handleSelectFaultCode}
          hypotheses={hypotheses}
          expandedHypothesisId={expandedHypothesisId}
          expandedHypothesisDetails={expandedHypothesisDetails}
          hypothesisDetailsById={hypothesisDetailsById}
          isLoadingHypotheses={Boolean(incidentId && !mockData && !mockHypotheses && hypothesesQuery.isLoading)}
          isLoadingHypothesisDetails={Boolean(expandedHypothesisId != null && hypothesisDetailQuery.isLoading)}
          isUpdatingHypothesisStatus={updateHypothesisMutation.isPending}
          onToggleHypothesis={handleToggleHypothesis}
          onUpdateHypothesisStatus={handleUpdateHypothesisStatus}
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          onSelectDevice={handleSelectDeviceFromSidebar}
          displaySettings={displaySettings}
          onDisplaySettingChange={handleDisplaySettingChange}
          kHop={currentKHop}
          filterMode={currentFilterMode}
          onKHopChange={setCurrentKHop}
          onFilterModeChange={setCurrentFilterMode}
          onResetDisplaySettings={handleResetDisplaySettings}
          locale={locale}
        />

        {/* Center: Stratified 5-Tier Canvas Engine */}
        <main className="flex-1 h-full min-w-0 min-h-0 relative overflow-hidden bg-[#f8fafc] dark:bg-[#070a10]">
          {isLoading && !mockData ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-xs font-bold tracking-wider mt-2.5">
                {locale === 'en' ? 'LOADING TOPOLOGY GRAPH…' : 'ĐANG TẢI BẢN ĐỒ TOPOLOGY…'}
              </span>
            </div>
          ) : isError && !mockData ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-rose-500 px-4 text-center">
              <svg className="w-10 h-10 mb-3 text-rose-500/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                {locale === 'en' ? 'Failed to Load Topology Graph' : 'Không thể tải bản đồ topology'}
              </h3>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                {(error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error)?.message || (locale === 'en' ? 'Unable to connect to topology service' : 'Không thể kết nối đến máy chủ topology')}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3.5 px-3 py-1 text-xs font-mono font-semibold rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
              >
                {locale === 'en' ? 'RETRY' : 'THỬ LẠI'}
              </button>
            </div>
          ) : !mockData && nodes.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 px-4 text-center">
              <span className="font-mono text-sm font-semibold text-slate-600 dark:text-slate-300">
                {locale === 'en' ? 'No Topology Data Found' : 'Không tìm thấy dữ liệu mạng'}
              </span>
              <p className="font-mono text-xs text-slate-400 mt-1">
                {locale === 'en' ? '0 devices and 0 links returned from topology service.' : '0 thiết bị và 0 liên kết trả về từ máy chủ.'}
              </p>
            </div>
          ) : (
            <TopologyCanvas
              ref={canvasRef}
              nodes={nodes}
              links={links}
              locale={locale}
              selectedNodeId={selectedNodeId || undefined}
              selectedLinkId={selectedLinkId || undefined}
              focusedNodeIds={Array.from(effectiveFocusedNodeIds)}
              blastRadiusLinkIds={blastRadiusLinkIds}
              blastRadiusReport={blastRadiusReport}
              isIncidentMode={Boolean(incidentId)}
              kHop={currentKHop}
              filterMode={currentFilterMode}
              onKHopChange={setCurrentKHop}
              onFilterModeChange={setCurrentFilterMode}
              onSelectNode={handleSelectNode}
              onFocusNode={handleFocusNode}
              onClearFocus={handleClearFocus}
              onSelectLink={handleSelectLink}
              showTierBands={displaySettings.showTierBands}
              showCenterlines={displaySettings.showCenterlines}
              showCounts={displaySettings.showCounts}
              showPortLabels={displaySettings.showPortLabels}
              showLegend={true}
              showControls={true}
              showKHopControls={true}
            />
          )}
        </main>

        {/* Right Sidebar: Network Health Overview & Inspector */}
        <TopologyRightSidebar
          nodes={nodes}
          links={links}
          selectedNode={selectedNode}
          selectedLink={selectedLink}
          incidentId={incidentId}
          onSelectNode={handleSelectDeviceFromSidebar}
          onSelectLink={handleSelectLink}
          onCloseInspect={handleCloseInspect}
          locale={locale}
        />
      </div>
    </div>
  )
}

export default TopologyPage
