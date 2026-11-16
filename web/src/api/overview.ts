import { apiClient } from './client'
import type { IncidentSummary } from './incidents'

export interface OverviewMetrics {
  nodesUp: number
  nodesTotal: number
  nodesWarning: number
  nodesCritical: number
  openAlarms: number
  openIncidents: number
  portsDown: number
}

export interface OverviewData {
  metrics: OverviewMetrics
  topIncident: IncidentSummary | null
  openIncidents: IncidentSummary[]
  recentlyResolved: IncidentSummary[]
}

export async function getOverview(): Promise<OverviewData> {
  const response = await apiClient.get<OverviewData>('/overview')
  return response.data
}
