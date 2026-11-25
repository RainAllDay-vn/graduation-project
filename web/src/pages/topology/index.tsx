import React, { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import { getTopology, getSubgraph } from '@/api/topology'
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
}

export const TopologyPage: React.FC<TopologyPageProps> = ({
  initialIncidentId,
  initialFocusNodeId,
  mockData,
}) => {
  const [searchParams] = useSearchParams()
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
  const canvasRef = useRef<TopologyCanvasHandle>(null)

  // Double click: Set of active beacon focus nodes (Stylebook §3.5: multiple beacons)
  const [focusedNodeIds, setFocusedNodeIds] = useState<Set<string>>(() => {
    const s = new Set<string>()
    if (focusNodeId) s.add(focusNodeId)
    if (incidentId) s.add('CORE-02')
    return s
  })
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

  // Incident blast radius logic (to be loaded dynamically via API in Incident Mode 5.6)
  const blastRadiusLinkIds = useMemo(() => {
    if (!incidentId) return undefined
    return undefined
  }, [incidentId])

  // Single click: Only updates selection and inspector context (Stylebook §3.5: "không đụng beacon")
  const handleSelectNode = (node: DeviceSummary) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id))
    setSelectedLinkId(null)
  }

  // Device selection from Left Sidebar directory: updates selection in inspector and pans canvas to center node
  const handleSelectDeviceFromSidebar = (device: DeviceSummary) => {
    setSelectedNodeId(device.id)
    setSelectedLinkId(null)
    canvasRef.current?.panToNode(device.id)
  }

  // Double click: Toggles beacon focus on / off (Stylebook §3.5: "Bấm đúp một node → beacon... Bấm đúp lại → biến mất")
  const handleFocusNode = (node: DeviceSummary) => {
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
  }

  const handleSelectLink = (link: LinkSummary) => {
    setSelectedLinkId((prev) => (prev === link.linkId ? null : link.linkId))
    setSelectedNodeId(null)
  }

  const handleCloseInspect = () => {
    setSelectedNodeId(null)
    setSelectedLinkId(null)
  }

  return (
    <div
      className="w-full h-full flex flex-col bg-[#f8fafc] dark:bg-[#070a10] text-[#0f172a] dark:text-[#f8fafc] overflow-hidden select-none"
      data-testid="topology-page"
    >
      {/* 1. Contextual Thin Top Header (Stylebook §0.1) */}
      <TopologyHeader
        incidentId={incidentId}
        totalNodes={nodes.length}
        totalLinks={links.length}
        focusNodeId={
          focusedNodeIds.size === 1
            ? Array.from(focusedNodeIds)[0]
            : focusedNodeIds.size > 1
              ? `${focusedNodeIds.size} TIÊU ĐIỂM`
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
                {(error as any)?.response?.data?.message || (error as Error)?.message || (locale === 'en' ? 'Unable to connect to topology service' : 'Không thể kết nối đến máy chủ topology')}
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
              focusedNodeIds={Array.from(focusedNodeIds)}
              blastRadiusLinkIds={blastRadiusLinkIds}
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

        {/* Right Sidebar: Hardware Telemetry & Inspector Placeholders */}
        <TopologyRightSidebar
          nodes={nodes}
          links={links}
          selectedNode={selectedNode}
          selectedLink={selectedLink}
          onCloseInspect={handleCloseInspect}
          locale={locale}
        />
      </div>
    </div>
  )
}

export default TopologyPage
