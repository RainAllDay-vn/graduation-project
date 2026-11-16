import { apiClient } from './client'
import type { DeviceSummary } from './topology'

export type ServiceType =
  | 'INTERNET_TRANSIT'
  | 'VPN_MPLS'
  | 'VOIP'
  | 'IPTV'
  | 'CLOUD_CONNECT'
  | 'DATACENTER'
  | 'DNS'

export type ServiceStatus = 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE'

export interface NetworkServiceSummary {
  id: string
  name: string
  description?: string
  type: ServiceType
  region: string
  status: ServiceStatus
  subscriberCount: number
  dependentDeviceCount: number
}

export interface NetworkServiceDetails {
  id: string
  name: string
  description?: string
  type: ServiceType
  region: string
  status: ServiceStatus
  subscriberCount: number
  dependentDevices: DeviceSummary[]
}

export interface ServiceImpactReport {
  serviceId: string
  serviceName: string
  serviceStatus: ServiceStatus
  totalDependentDevices: number
  activeDevices: number
  degradedDevices: number
  outageDevices: number
  affectedDevices: DeviceSummary[]
  description: string
}

export interface GetServicesParams {
  type?: ServiceType
  region?: string
  status?: ServiceStatus
  q?: string
}

export interface UpdateServiceStatusRequest {
  status: ServiceStatus
}

/**
 * Retrieve all network services, optionally filtered by type, region, status, and query.
 */
export async function getServices(params?: GetServicesParams): Promise<NetworkServiceSummary[]> {
  const response = await apiClient.get<NetworkServiceSummary[]>('/services', { params })
  return response.data
}

/**
 * Retrieve detailed information of a specific service including dependent devices.
 */
export async function getServiceById(id: string): Promise<NetworkServiceDetails> {
  const response = await apiClient.get<NetworkServiceDetails>(`/services/${encodeURIComponent(id)}`)
  return response.data
}

/**
 * Retrieve impact report of a specific service.
 */
export async function getServiceImpact(id: string): Promise<ServiceImpactReport> {
  const response = await apiClient.get<ServiceImpactReport>(`/services/${encodeURIComponent(id)}/impact`)
  return response.data
}

/**
 * Update lifecycle status of a network service.
 */
export async function updateServiceStatus(
  id: string,
  request: UpdateServiceStatusRequest
): Promise<NetworkServiceDetails> {
  const response = await apiClient.patch<NetworkServiceDetails>(
    `/services/${encodeURIComponent(id)}/status`,
    request
  )
  return response.data
}
