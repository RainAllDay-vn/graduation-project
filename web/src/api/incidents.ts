import { apiClient } from './client'

export type IncidentStatus =
  | 'OPEN'
  | 'PRIORITIZED'
  | 'INVESTIGATING'
  | 'MITIGATED'
  | 'RESOLVED'

export type Severity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'

export type AlarmType = 'FAULT_CODE' | 'RULE_BASED'

export interface AlarmSummary {
  id: string
  deviceId: string
  timestamp: string
  severity: Severity
  alarmType: AlarmType
  faultCode: string
  message: string
  isCurrentIncident: boolean
}

export interface IncidentSummary {
  id: string
  title: string
  status: IncidentStatus
  severity: Severity
  region: string
  primaryDeviceId: string
  openedAt: string
  alarmCount: number
}

export interface IncidentDetails {
  id: string
  title: string
  description: string
  status: IncidentStatus
  severity: Severity
  region: string
  primaryDeviceId: string
  openedAt: string
  resolvedAt?: string | null
  alarmCount: number
  alarms: AlarmSummary[]
  createdAt: string
  updatedAt: string
}

export interface GetIncidentsParams {
  status?: IncidentStatus
  severity?: Severity
}

/**
 * Retrieve all incidents, optionally filtered by status and severity.
 */
export async function getIncidents(params?: GetIncidentsParams): Promise<IncidentSummary[]> {
  const response = await apiClient.get<IncidentSummary[]>('/incidents', { params })
  return response.data
}

/**
 * Retrieve comprehensive incident details by ID.
 */
export async function getIncidentById(id: string): Promise<IncidentDetails> {
  const response = await apiClient.get<IncidentDetails>(`/incidents/${id}`)
  return response.data
}

/**
 * Retrieve alarms associated with a specific incident.
 */
export async function getAlarmsByIncidentId(id: string): Promise<AlarmSummary[]> {
  const response = await apiClient.get<AlarmSummary[]>(`/incidents/${id}/alarms`)
  return response.data
}

/**
 * Update incident lifecycle status.
 */
export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus,
  resolutionNote?: string
): Promise<IncidentDetails> {
  const response = await apiClient.patch<IncidentDetails>(`/incidents/${id}/status`, {
    status,
    resolutionNote,
  })
  return response.data
}
