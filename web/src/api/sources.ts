import { apiClient } from './client'

export type SourceType = 'REST' | 'MQ'
export type SourceStatus = 'PENDING_FIRST_SYNC' | 'ACTIVE' | 'ERROR'
export type SourceAuthType = 'NONE' | 'BEARER_TOKEN' | 'API_KEY'
export type SyncStatus = 'RUNNING' | 'SUCCESS' | 'FAILED'
export type SyncTriggerType = 'SCHEDULED' | 'MANUAL' | 'RETRY'

export interface FieldMappingDto {
  sourceField: string
  targetField: string | null
}

export interface ExternalSourceSummary {
  id: string
  name: string
  type: SourceType
  status: SourceStatus
  endpointUrl?: string
  pollIntervalSeconds?: number
  brokerAddress?: string
  topic?: string
  streamLatencyMs?: number
  lastSyncStatus?: SyncStatus
  lastSyncAt?: string
  lastSyncMessage?: string
}

export interface ExternalSourceDetails extends ExternalSourceSummary {
  consumerGroup?: string
  authType?: SourceAuthType
  authTokenMasked?: string
  retryAttempts?: number
  fieldMappings: FieldMappingDto[]
  createdAt: string
  updatedAt: string
}

export interface SyncRunSummary {
  id: string
  triggerType: SyncTriggerType
  status: SyncStatus
  recordsFetched: number
  recordsFailed: number
  message?: string
  startedAt: string
  finishedAt?: string
  updatedAt?: string
}

export interface SyncHistoryPage {
  content: SyncRunSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface GetSyncHistoryParams {
  page?: number
  size?: number
}

export interface SyncHistoryStreamEvent {
  sourceId: string
  record: SyncRunSummary | null
  sourceStatus: SourceStatus
  lastSyncAt?: string
  lastSyncStatus?: SyncStatus
  lastSyncMessage?: string
}

export interface SyncHistoryStreamHandlers {
  onSyncRecord: (event: SyncHistoryStreamEvent) => void
  onConnectionChange?: (connected: boolean) => void
}

export interface TestConnectionResult {
  success: boolean
  message: string
  latencyMs?: number
}

export interface GetSourcesParams {
  type?: SourceType
  status?: SourceStatus
  q?: string
}

export interface CreateExternalSourceRequest {
  name: string
  type: SourceType
  endpointUrl?: string
  pollIntervalSeconds?: number
  brokerAddress?: string
  topic?: string
  consumerGroup?: string
  authType?: SourceAuthType
  authToken?: string
}

export interface UpdateExternalSourceRequest {
  endpointUrl?: string
  pollIntervalSeconds?: number
  brokerAddress?: string
  topic?: string
  consumerGroup?: string
  authType?: SourceAuthType
  authToken?: string
  fieldMappings?: FieldMappingDto[]
}

/**
 * Retrieve all configured third-party data sources with optional filters.
 */
export async function getSources(params?: GetSourcesParams): Promise<ExternalSourceSummary[]> {
  const response = await apiClient.get<ExternalSourceSummary[]>('/sources', { params })
  return response.data
}

/**
 * Retrieve the full configuration and field mappings of a data source.
 */
export async function getSourceById(id: string): Promise<ExternalSourceDetails> {
  const response = await apiClient.get<ExternalSourceDetails>(`/sources/${encodeURIComponent(id)}`)
  return response.data
}

/**
 * Register a new external data source.
 */
export async function createSource(request: CreateExternalSourceRequest): Promise<ExternalSourceDetails> {
  const response = await apiClient.post<ExternalSourceDetails>('/sources', request)
  return response.data
}

/**
 * Update configuration or field mappings of an existing source.
 */
export async function updateSource(
  id: string,
  request: UpdateExternalSourceRequest
): Promise<ExternalSourceDetails> {
  const response = await apiClient.put<ExternalSourceDetails>(
    `/sources/${encodeURIComponent(id)}`,
    request
  )
  return response.data
}

/**
 * Delete an external data source and its sync records.
 */
export async function deleteSource(id: string): Promise<void> {
  await apiClient.delete(`/sources/${encodeURIComponent(id)}`)
}

/**
 * Probe a data source connection inline without persisting changes.
 */
export async function testConnection(id: string): Promise<TestConnectionResult> {
  const response = await apiClient.post<TestConnectionResult>(
    `/sources/${encodeURIComponent(id)}/test-connection`
  )
  return response.data
}

/**
 * Trigger a full re-sync from scratch for a REST data source.
 */
export async function resyncFromScratch(id: string): Promise<SyncRunSummary> {
  const response = await apiClient.post<SyncRunSummary>(
    `/sources/${encodeURIComponent(id)}/resync`
  )
  return response.data
}

/**
 * Retrieve paginated sync history records for a REST data source (latest update first).
 */
export async function getSyncHistory(
  id: string,
  params?: GetSyncHistoryParams
): Promise<SyncHistoryPage> {
  const response = await apiClient.get<SyncHistoryPage>(
    `/sources/${encodeURIComponent(id)}/sync-history`,
    { params }
  )
  return response.data
}

/**
 * Subscribe to real-time sync history SSE updates for a REST data source.
 */
export function subscribeSyncHistory(
  id: string,
  handlers: SyncHistoryStreamHandlers
): () => void {
  const url = `/api/sources/${encodeURIComponent(id)}/sync-history/stream`
  const eventSource = new EventSource(url, { withCredentials: true })

  const handleConnected = () => {
    handlers.onConnectionChange?.(true)
  }

  const handleSyncRecord = (messageEvent: MessageEvent<string>) => {
    try {
      const payload = JSON.parse(messageEvent.data) as SyncHistoryStreamEvent
      handlers.onSyncRecord(payload)
    } catch {
      // Ignore malformed SSE payloads
    }
  }

  eventSource.addEventListener('connected', handleConnected)
  eventSource.addEventListener('sync-record', handleSyncRecord as EventListener)
  eventSource.onopen = () => {
    handlers.onConnectionChange?.(true)
  }
  eventSource.onerror = () => {
    handlers.onConnectionChange?.(false)
  }

  return () => {
    eventSource.removeEventListener('connected', handleConnected)
    eventSource.removeEventListener('sync-record', handleSyncRecord as EventListener)
    eventSource.close()
    handlers.onConnectionChange?.(false)
  }
}
