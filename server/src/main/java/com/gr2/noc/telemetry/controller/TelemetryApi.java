package com.gr2.noc.telemetry.controller;

import com.gr2.noc.telemetry.dto.create.RecordDeviceTelemetrySnapshotRequest;
import com.gr2.noc.telemetry.dto.create.RecordTelemetryPointRequest;
import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * REST API Contract for Network Device Telemetry and Metrics monitoring.
 */
@RequestMapping("/api/devices/{deviceId}/telemetry")
public interface TelemetryApi {

    /**
     * Retrieve the latest telemetry snapshot (CPU, Memory, Temperature, Routes, Uptime) for a device.
     * Used by Inspector Telemetry section (Stylebook 5.3).
     */
    @GetMapping("/snapshot")
    ResponseEntity<DeviceTelemetrySnapshotDetails> getLatestSnapshot(@PathVariable String deviceId);

    /**
     * Ingest or update a telemetry snapshot for a device.
     */
    @PostMapping("/snapshot")
    ResponseEntity<DeviceTelemetrySnapshotDetails> recordSnapshot(
            @PathVariable String deviceId,
            @Valid @RequestBody RecordDeviceTelemetrySnapshotRequest request
    );

    /**
     * Retrieve timeseries metrics for chart visualization in Inspector (e.g. CPU, TEMPERATURE).
     */
    @GetMapping("/timeseries")
    ResponseEntity<TelemetryMetricSeries> getMetricTimeseries(
            @PathVariable String deviceId,
            @RequestParam String metricName,
            @RequestParam(required = false) Instant start,
            @RequestParam(required = false) Instant end
    );

    /**
     * Ingest batch timeseries points for a device.
     */
    @PostMapping("/timeseries")
    ResponseEntity<Map<String, Object>> recordTimeseriesPoints(
            @PathVariable String deviceId,
            @Valid @RequestBody List<RecordTelemetryPointRequest> requests
    );

    /**
     * List all distinct metric names available for a device.
     */
    @GetMapping("/metrics")
    ResponseEntity<List<String>> getAvailableMetrics(@PathVariable String deviceId);
}
