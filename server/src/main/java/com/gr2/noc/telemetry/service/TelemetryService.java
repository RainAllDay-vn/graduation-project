package com.gr2.noc.telemetry.service;

import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;

import java.time.Instant;

/**
 * Service contract for device telemetry snapshots and timeseries metrics.
 */
public interface TelemetryService {

    /**
     * Retrieve the most recent telemetry snapshot for a device.
     */
    DeviceTelemetrySnapshotDetails getLatestSnapshot(String deviceId);

    /**
     * Retrieve historical timeseries points for a specific metric on a device.
     */
    TelemetryMetricSeries getMetricTimeseries(String deviceId, String metricName, Instant start, Instant end);
}
