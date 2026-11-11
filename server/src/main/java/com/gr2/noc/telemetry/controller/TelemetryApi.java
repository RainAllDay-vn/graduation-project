package com.gr2.noc.telemetry.controller;

import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

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
     * Retrieve timeseries metrics for chart visualization in Inspector (e.g. CPU, TEMPERATURE).
     */
    @GetMapping("/timeseries")
    ResponseEntity<TelemetryMetricSeries> getMetricTimeseries(
            @PathVariable String deviceId,
            @RequestParam String metricName,
            @RequestParam(required = false) Instant start,
            @RequestParam(required = false) Instant end
    );
}
