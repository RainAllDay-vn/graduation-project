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

export interface GetTopologyParams {
  layer?: DeviceLayer
  region?: string
}

/**
 * Retrieve complete network topology graph.
 */
export async function getTopology(params?: GetTopologyParams): Promise<TopologyGraph> {
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
