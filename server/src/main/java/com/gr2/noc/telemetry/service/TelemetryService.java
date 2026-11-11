package com.gr2.noc.telemetry.service;

import com.gr2.noc.telemetry.dto.create.RecordDeviceTelemetrySnapshotRequest;
import com.gr2.noc.telemetry.dto.create.RecordTelemetryPointRequest;
import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;

import java.time.Instant;
import java.util.List;

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

    /**
     * Ingest or update a telemetry snapshot for a device.
     */
    DeviceTelemetrySnapshotDetails recordSnapshot(String deviceId, RecordDeviceTelemetrySnapshotRequest request);

    /**
     * Batch ingest historical or streaming timeseries metric points for a device.
     */
    int recordTimeseriesPoints(String deviceId, List<RecordTelemetryPointRequest> requests);

    /**
     * List all distinct metric names available for a device (e.g. ["CPU", "TEMPERATURE"]).
     */
    List<String> getAvailableMetrics(String deviceId);
}
