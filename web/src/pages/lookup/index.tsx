import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '@/context'
import {
  getTopology,
  getDeviceById,
  type DeviceSummary,
  type DeviceDetails,
  type LinkSummary,
} from '@/api/topology'
import {
  getServices,
  getServiceById,
  getServiceImpact,
  type NetworkServiceSummary,
  type NetworkServiceDetails,
  type ServiceImpactReport,
} from '@/api/services'
import { getIncidents, type IncidentSummary } from '@/api/incidents'
import {
  type LookupTab,
  filterDevices,
  filterLinks,
  filterServices,
} from './components/lookupUtils'
import { LookupTabs } from './components/LookupTabs'
import { LookupFilterBar } from './components/LookupFilterBar'
import { LookupTable } from './components/LookupTable'
import { LookupInspectorPanel } from './components/LookupInspectorPanel'
import { LandingFooter } from '@/pages/_components/LandingFooter'

export interface LookupViewProps {
  activeTab: LookupTab
  counts: {
    devices: number
    links: number
    services: number
  }
  searchQuery: string
  layerFilter: string
  typeFilter: string
  regionFilter: string
  statusFilter: string
  availableRegions: string[]
  filteredDevices: DeviceSummary[]
  filteredLinks: LinkSummary[]
  filteredServices: NetworkServiceSummary[]
  selectedId: string | null
  selectedDevice: (DeviceDetails | DeviceSummary) | null
  selectedLink: LinkSummary | null
  selectedService: (NetworkServiceDetails | NetworkServiceSummary) | null
  serviceImpact: ServiceImpactReport | null
  correlatedIncident: IncidentSummary | null
  isLoading: boolean
  isLoadingDetails: boolean
  locale?: 'vi' | 'en'
  onTabChange: (tab: LookupTab) => void
  onSearchChange: (q: string) => void
  onLayerChange: (layer: string) => void
  onTypeChange: (type: string) => void
  onRegionChange: (region: string) => void
  onStatusChange: (status: string) => void
  onResetFilters: () => void
  onSelect: (id: string) => void
  onNavigateToTopology: (target: {
    type: LookupTab
    id: string
    nodeId?: string
  }) => void
  onSelectDependentDevice?: (deviceId: string) => void
}

export function LookupView({
  activeTab,
  counts,
  searchQuery,
  layerFilter,
  typeFilter,
  regionFilter,
  statusFilter,
  availableRegions,
  filteredDevices,
  filteredLinks,
  filteredServices,
  selectedId,
  selectedDevice,
  selectedLink,
  selectedService,
  serviceImpact,
  correlatedIncident,
  isLoading,
  isLoadingDetails,
  locale = 'vi',
  onTabChange,
  onSearchChange,
  onLayerChange,
  onTypeChange,
  onRegionChange,
  onStatusChange,
  onResetFilters,
  onSelect,
  onNavigateToTopology,
  onSelectDependentDevice,
}: LookupViewProps) {
  const isEn = locale === 'en'

  return (
    <div className="w-full flex-1 flex flex-col justify-between px-6 md:px-12 py-7 transition-colors">
      <div className="w-full">
        {/* Tool row: Search & dynamic multi-filter controls */}
        <LookupFilterBar
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          layerFilter={layerFilter}
          onLayerChange={onLayerChange}
          typeFilter={typeFilter}
          onTypeChange={onTypeChange}
          regionFilter={regionFilter}
          onRegionChange={onRegionChange}
          statusFilter={statusFilter}
          onStatusChange={onStatusChange}
          availableRegions={availableRegions}
          locale={locale}
          onResetFilters={onResetFilters}
        />

        {/* Tab switch row */}
        <div className="mt-5">
          <LookupTabs
            activeTab={activeTab}
            counts={counts}
            locale={locale}
            onTabChange={onTabChange}
          />
        </div>

        {/* Main Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mt-5 items-start">
          {/* Table (Master) */}
          <div className="min-w-0">
            <LookupTable
              activeTab={activeTab}
              devices={filteredDevices}
              links={filteredLinks}
              services={filteredServices}
              selectedId={selectedId}
              isLoading={isLoading}
              locale={locale}
              onSelect={onSelect}
              onResetFilters={onResetFilters}
            />
          </div>

          {/* Inspector Panel (Detail) */}
          <div className="min-w-0 sticky top-6">
            <LookupInspectorPanel
              activeTab={activeTab}
              selectedDevice={selectedDevice}
              selectedLink={selectedLink}
              selectedService={selectedService}
              serviceImpact={serviceImpact}
              correlatedIncident={correlatedIncident}
              isLoadingDetails={isLoadingDetails}
              locale={locale}
              onNavigateToTopology={onNavigateToTopology}
              onSelectDependentDevice={onSelectDependentDevice}
            />
          </div>
        </div>
      </div>

      {/* Global standard NOC footer */}
      <LandingFooter
        version="v0.4"
        environment="TEST"
        supportContact={isEn ? 'INTERNAL IT' : 'IT NỘI BỘ'}
        locale={locale}
      />
    </div>
  )
}

export default function LookupPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { locale } = useTheme()

  // Initialize state from URL params
  const initialTabParam = searchParams.get('tab')
  const initialTab: LookupTab =
    initialTabParam === 'links' || initialTabParam === 'services'
      ? initialTabParam
      : 'devices'

  const [activeTab, setActiveTab] = useState<LookupTab>(initialTab)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [layerFilter, setLayerFilter] = useState(searchParams.get('layer') || 'ALL')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'ALL')
  const [regionFilter, setRegionFilter] = useState(searchParams.get('region') || 'ALL')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL')
  const [selectedId, setSelectedId] = useState<string | null>(
    searchParams.get('id') || searchParams.get('focusId') || null
  )

  // 1. Fetch Topology
  const { data: topology, isLoading: isLoadingTopology } = useQuery({
    queryKey: ['topology'],
    queryFn: () => getTopology(),
    refetchInterval: 30000,
  })

  // 2. Fetch Services
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => getServices(),
    refetchInterval: 30000,
  })

  // 3. Fetch Incidents for correlation
  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => getIncidents(),
    refetchInterval: 30000,
  })

  const devices = useMemo(() => topology?.nodes || [], [topology])
  const links = useMemo(() => topology?.links || [], [topology])

  // Extract available regions dynamically from devices & services
  const availableRegions = useMemo(() => {
    const set = new Set<string>()
    devices.forEach((d) => d.region && set.add(d.region))
    services.forEach((s) => s.region && set.add(s.region))
    return Array.from(set)
  }, [devices, services])

  // Filtered lists
  const filteredDevices = useMemo(
    () => filterDevices(devices, searchQuery, layerFilter, regionFilter, statusFilter),
    [devices, searchQuery, layerFilter, regionFilter, statusFilter]
  )

  const filteredLinks = useMemo(
    () => filterLinks(links, searchQuery, typeFilter, statusFilter),
    [links, searchQuery, typeFilter, statusFilter]
  )

  const filteredServices = useMemo(
    () => filterServices(services, searchQuery, typeFilter, regionFilter, statusFilter),
    [services, searchQuery, typeFilter, regionFilter, statusFilter]
  )

  // Tab counts
  const counts = useMemo(
    () => ({
      devices: devices.length,
      links: links.length,
      services: services.length,
    }),
    [devices.length, links.length, services.length]
  )

  // Auto-select first item if none selected or if previously selected item is no longer in view
  useEffect(() => {
    if (selectedId) return

    if (activeTab === 'devices' && filteredDevices.length > 0) {
      setSelectedId(filteredDevices[0].id)
    } else if (activeTab === 'links' && filteredLinks.length > 0) {
      setSelectedId(filteredLinks[0].linkId)
    } else if (activeTab === 'services' && filteredServices.length > 0) {
      setSelectedId(filteredServices[0].id)
    }
  }, [activeTab, filteredDevices, filteredLinks, filteredServices, selectedId])

  // Sync state back to URL search params
  useEffect(() => {
    const params = new URLSearchParams()
    if (activeTab !== 'devices') params.set('tab', activeTab)
    if (searchQuery.trim()) params.set('q', searchQuery.trim())
    if (layerFilter !== 'ALL') params.set('layer', layerFilter)
    if (typeFilter !== 'ALL') params.set('type', typeFilter)
    if (regionFilter !== 'ALL') params.set('region', regionFilter)
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (selectedId) params.set('id', selectedId)

    setSearchParams(params, { replace: true })
  }, [
    activeTab,
    searchQuery,
    layerFilter,
    typeFilter,
    regionFilter,
    statusFilter,
    selectedId,
    setSearchParams,
  ])

  // 4. Detailed query for selected device (with links)
  const isDeviceSelected = activeTab === 'devices' && Boolean(selectedId)
  const { data: deviceDetails, isLoading: isLoadingDeviceDetails } = useQuery({
    queryKey: ['device', selectedId],
    queryFn: () => getDeviceById(selectedId!),
    enabled: isDeviceSelected,
  })

  // 5. Detailed query for selected service (with dependent devices & impact)
  const isServiceSelected = activeTab === 'services' && Boolean(selectedId)
  const { data: serviceDetails, isLoading: isLoadingServiceDetails } = useQuery({
    queryKey: ['service', selectedId],
    queryFn: () => getServiceById(selectedId!),
    enabled: isServiceSelected,
  })

  const { data: serviceImpact, isLoading: isLoadingServiceImpact } = useQuery({
    queryKey: ['serviceImpact', selectedId],
    queryFn: () => getServiceImpact(selectedId!),
    enabled: isServiceSelected,
  })

  // Resolve selected items
  const selectedDevice = useMemo(() => {
    if (activeTab !== 'devices' || !selectedId) return null
    if (deviceDetails) return deviceDetails
    return devices.find((d) => d.id === selectedId) || null
  }, [activeTab, selectedId, deviceDetails, devices])

  const selectedLink = useMemo(() => {
    if (activeTab !== 'links' || !selectedId) return null
    return links.find((l) => l.linkId === selectedId) || null
  }, [activeTab, selectedId, links])

  const selectedService = useMemo(() => {
    if (activeTab !== 'services' || !selectedId) return null
    if (serviceDetails) return serviceDetails
    return services.find((s) => s.id === selectedId) || null
  }, [activeTab, selectedId, serviceDetails, services])

  // Correlated Incident
  const correlatedIncident = useMemo(() => {
    if (!selectedId || incidents.length === 0) return null

    if (activeTab === 'devices') {
      return incidents.find((inc) => inc.primaryDeviceId === selectedId) || null
    }

    if (activeTab === 'links' && selectedLink) {
      return (
        incidents.find(
          (inc) =>
            inc.primaryDeviceId === selectedLink.sourceDeviceId ||
            inc.primaryDeviceId === selectedLink.targetDeviceId
        ) || null
      )
    }

    if (activeTab === 'services' && selectedService) {
      const depIds =
        'dependentDevices' in selectedService
          ? selectedService.dependentDevices.map((d) => d.id)
          : []
      return incidents.find((inc) => depIds.includes(inc.primaryDeviceId)) || null
    }

    return null
  }, [selectedId, incidents, activeTab, selectedLink, selectedService])

  // Handle Tab Switch
  const handleTabChange = (tab: LookupTab) => {
    setActiveTab(tab)
    setSelectedId(null)
    setLayerFilter('ALL')
    setTypeFilter('ALL')
    setRegionFilter('ALL')
    setStatusFilter('ALL')
  }

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setLayerFilter('ALL')
    setTypeFilter('ALL')
    setRegionFilter('ALL')
    setStatusFilter('ALL')
  }

  // Handle Navigate to Topology
  const handleNavigateToTopology = (target: {
    type: LookupTab
    id: string
    nodeId?: string
  }) => {
    const focus = target.nodeId || target.id
    navigate(`/dashboard?focusNodeId=${encodeURIComponent(focus)}`)
  }

  // Handle clicking dependent device chip inside service inspector
  const handleSelectDependentDevice = (deviceId: string) => {
    setActiveTab('devices')
    setSelectedId(deviceId)
    setSearchQuery('')
    setLayerFilter('ALL')
    setRegionFilter('ALL')
    setStatusFilter('ALL')
  }

  const isLoading = isLoadingTopology || isLoadingServices
  const isLoadingDetails =
    (isDeviceSelected && isLoadingDeviceDetails) ||
    (isServiceSelected && (isLoadingServiceDetails || isLoadingServiceImpact))

  return (
    <LookupView
      activeTab={activeTab}
      counts={counts}
      searchQuery={searchQuery}
      layerFilter={layerFilter}
      typeFilter={typeFilter}
      regionFilter={regionFilter}
      statusFilter={statusFilter}
      availableRegions={availableRegions}
      filteredDevices={filteredDevices}
      filteredLinks={filteredLinks}
      filteredServices={filteredServices}
      selectedId={selectedId}
      selectedDevice={selectedDevice}
      selectedLink={selectedLink}
      selectedService={selectedService}
      serviceImpact={serviceImpact || null}
      correlatedIncident={correlatedIncident}
      isLoading={isLoading}
      isLoadingDetails={isLoadingDetails}
      locale={locale}
      onTabChange={handleTabChange}
      onSearchChange={setSearchQuery}
      onLayerChange={setLayerFilter}
      onTypeChange={setTypeFilter}
      onRegionChange={setRegionFilter}
      onStatusChange={setStatusFilter}
      onResetFilters={handleResetFilters}
      onSelect={setSelectedId}
      onNavigateToTopology={handleNavigateToTopology}
      onSelectDependentDevice={handleSelectDependentDevice}
    />
  )
}
