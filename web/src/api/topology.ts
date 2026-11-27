import { apiClient } from './client'

export type DeviceLayer =
  | 'PEER'
  | 'IGW'
  | 'CORE'
  | 'AGGREGATION'
  | 'EXCHANGE'
  | 'ACCESS'

export type DeviceStatus = 'ACTIVE' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE'

export type LinkType = 'PHYSICAL_FIBER' | 'LOGICAL_IP'

export interface DeviceSummary {
  id: string
  name: string
  layer: DeviceLayer
  region: string
  site: string
  ipAddress: string
  model: string
  status: DeviceStatus
  accessDeviceCount: number
  accessErrorCount: number
}

export interface LinkSummary {
  linkId: string
  sourceDeviceId: string
  targetDeviceId: string
  sourcePort: string
  targetPort: string
  linkType: LinkType
  capacityGbps?: number
  operStatus: string
  rxPowerDbm?: number
  txPowerDbm?: number
  utilizationPercent?: number
  isBackup?: boolean
}

export interface TopologyGraph {
  nodes: DeviceSummary[]
  links: LinkSummary[]
}

export interface DeviceDetails extends DeviceSummary {
  links: LinkSummary[]
}

export interface BlastRadiusReport {
  rootCauseDeviceId: string
  affectedDeviceIds: string[]
  affectedLinkIds: string[]
  estimatedAffectedSubscribers: number
  description: string
}

export interface GetTopologyParams {
  focusNodeIds?: string[]
  focusLayer?: DeviceLayer
  kHop?: number
  maxNodes?: number
  layer?: DeviceLayer
  region?: string
}

export interface SearchDevicesParams {
  search?: string
  layer?: DeviceLayer
  status?: DeviceStatus
  region?: string
  page?: number
  size?: number
}

export interface DeviceDirectoryPage {
  content: DeviceSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  availableRegions: string[]
}

/**
 * Retrieve a bounded topology graph centered on forced starting points
 * (focusNodeIds or focusLayer). The server returns 400 if no starting
 * points are provided.
 */
export async function getTopology(params: GetTopologyParams): Promise<TopologyGraph> {
  const response = await apiClient.get<TopologyGraph>('/topology', { params })
  return response.data
}

/**
 * Retrieve a focused subgraph (by focusNodeId or incidentId).
 */
export async function getSubgraph(params?: {
  focusNodeId?: string
  incidentId?: string
  kHop?: number
}): Promise<TopologyGraph> {
  const response = await apiClient.get<TopologyGraph>('/topology/subgraph', { params })
  return response.data
}

/**
 * Paged device directory with server-side search and filters.
 */
export async function searchDevices(params?: SearchDevicesParams): Promise<DeviceDirectoryPage> {
  const response = await apiClient.get<DeviceDirectoryPage>('/topology/devices', { params })
  return response.data
}

/**
 * Retrieve all network links in the topology.
 */
export async function getTopologyLinks(): Promise<LinkSummary[]> {
  const response = await apiClient.get<LinkSummary[]>('/topology/links')
  return response.data
}

/**
 * Retrieve comprehensive details of a specific network device, including direct links.
 */
export async function getDeviceById(id: string): Promise<DeviceDetails> {
  const response = await apiClient.get<DeviceDetails>(`/topology/devices/${encodeURIComponent(id)}`)
  return response.data
}

/**
 * Calculate outage blast radius (affected downstream devices, links, subscribers) for a root-cause device.
 */
export async function getBlastRadius(deviceId: string): Promise<BlastRadiusReport> {
  const response = await apiClient.get<BlastRadiusReport>(
    `/topology/blast-radius/${encodeURIComponent(deviceId)}`
  )
  return response.data
}
