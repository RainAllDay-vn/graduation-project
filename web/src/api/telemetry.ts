import axios from 'axios'
import { apiClient } from './client'

export type OperStatus = 'UP' | 'DOWN' | 'DEGRADED'

export interface DeviceTelemetrySnapshotDetails {
  deviceId: string
  collectedAt: string
  operStatus: OperStatus
  uptimeSeconds: number | null
  loadPercentage: number | null
  routesLearned: number | null
  routesUsed: number | null
  cpuPercent: number | null
  memoryPercent: number | null
  temperatureCelsius: number | null
}

export interface TelemetryTimeseriesPointDetails {
  timestamp: string
  value: number
  unit: string | null
}

export interface TelemetryMetricSeries {
  deviceId: string
  metricName: string
  unit: string | null
  points: TelemetryTimeseriesPointDetails[]
}

/**
 * Fetch the latest telemetry snapshot for a device.
 * Returns null if the backend responds 404 (no snapshot recorded for this device yet).
 */
export async function getDeviceTelemetrySnapshot(
  deviceId: string
): Promise<DeviceTelemetrySnapshotDetails | null> {
  try {
    const response = await apiClient.get<DeviceTelemetrySnapshotDetails>(
      `/devices/${encodeURIComponent(deviceId)}/telemetry/snapshot`
    )
    return response.data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null
    }
    throw err
  }
}

/**
 * Fetch distinct metric names that have timeseries points stored for this device.
 */
export async function getDeviceAvailableMetrics(deviceId: string): Promise<string[]> {
  const response = await apiClient.get<string[]>(
    `/devices/${encodeURIComponent(deviceId)}/telemetry/metrics`
  )
  return response.data
}

/**
 * Fetch timeseries points for a specific metric over [start, end].
 */
export async function getDeviceMetricTimeseries(
  deviceId: string,
  params: {
    metricName: string
    start?: string
    end?: string
  }
): Promise<TelemetryMetricSeries> {
  const response = await apiClient.get<TelemetryMetricSeries>(
    `/devices/${encodeURIComponent(deviceId)}/telemetry/timeseries`,
    { params }
  )
  return response.data
}
