import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { DeviceSummary, LinkSummary } from '@/api/topology'
import { getSubgraph } from '@/api/topology'
import { useTheme } from '@/context'
import {
  TopologyCanvas,
  TopologyHeader,
  TopologyLeftSidebar,
  TopologyRightSidebar,
} from './components'
import { sampleNodes, sampleLinks } from './components/canvas/mockTopologyData'

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

  const kHop = parseInt(searchParams.get('kHop') || '2', 10)

  // 2. Fetch topology subgraph data with graceful fallback
  const { data: remoteData, isLoading } = useQuery({
    queryKey: ['topology', 'subgraph', focusNodeId, incidentId, kHop],
    queryFn: () =>
      getSubgraph({
        focusNodeId: focusNodeId || undefined,
        incidentId: incidentId || undefined,
        kHop,
      }),
    enabled: !mockData,
    staleTime: 30000,
  })

  // Use provided mockData, fetched remoteData, or default sample network
  const nodes = useMemo(() => {
    if (mockData) return mockData.nodes
    if (remoteData?.nodes && remoteData.nodes.length > 0) return remoteData.nodes
    return sampleNodes
  }, [mockData, remoteData])

  const links = useMemo(() => {
    if (mockData) return mockData.links
    if (remoteData?.links && remoteData.links.length > 0) return remoteData.links
    return sampleLinks
  }, [mockData, remoteData])

  // 3. Selection & Inspection State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null)

  const selectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null),
    [selectedNodeId, nodes]
  )

  const selectedLink = useMemo(
    () => (selectedLinkId ? links.find((l) => l.linkId === selectedLinkId) ?? null : null),
    [selectedLinkId, links]
  )

  // Incident blast radius and epicenter logic
  const effectiveFocusNodeId = focusNodeId || (incidentId ? 'CORE-02' : undefined)
  const blastRadiusLinkIds = useMemo(() => {
    if (!incidentId) return undefined
    // Default affected blast radius links around CORE-02 epicenter
    return ['L-I2-C2', 'L-C2-A2', 'L-C2-A3']
  }, [incidentId])

  const handleSelectNode = (node: DeviceSummary) => {
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id))
    setSelectedLinkId(null)
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
        focusNodeId={effectiveFocusNodeId}
        focusHop={kHop}
        locale={locale}
      />

      {/* 2. 3-Column Workspace Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Sidebar: Navigation & Directory Placeholders */}
        <TopologyLeftSidebar incidentId={incidentId} locale={locale} />

        {/* Center: Stratified 5-Tier Canvas Engine */}
        <main className="flex-1 h-full min-w-0 min-h-0 relative overflow-hidden bg-[#f8fafc] dark:bg-[#070a10]">
          {isLoading && !mockData ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-xs font-bold tracking-wider mt-2.5">
                {locale === 'en' ? 'LOADING TOPOLOGY GRAPH…' : 'ĐANG TẢI BẢN ĐỒ TOPOLOGY…'}
              </span>
            </div>
          ) : (
            <TopologyCanvas
              nodes={nodes}
              links={links}
              locale={locale}
              selectedNodeId={selectedNodeId || undefined}
              selectedLinkId={selectedLinkId || undefined}
              focusNodeId={effectiveFocusNodeId}
              blastRadiusLinkIds={blastRadiusLinkIds}
              onSelectNode={handleSelectNode}
              onSelectLink={handleSelectLink}
              showLegend={true}
              showControls={true}
            />
          )}
        </main>

        {/* Right Sidebar: Hardware Telemetry & Inspector Placeholders */}
        <TopologyRightSidebar
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
