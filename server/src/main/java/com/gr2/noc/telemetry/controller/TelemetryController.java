package com.gr2.noc.telemetry.controller;

import com.gr2.noc.telemetry.dto.create.RecordDeviceTelemetrySnapshotRequest;
import com.gr2.noc.telemetry.dto.create.RecordTelemetryPointRequest;
import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;
import com.gr2.noc.telemetry.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class TelemetryController implements TelemetryApi {

    private final TelemetryService telemetryService;

    @Override
    public ResponseEntity<DeviceTelemetrySnapshotDetails> getLatestSnapshot(String deviceId) {
        return ResponseEntity.ok(telemetryService.getLatestSnapshot(deviceId));
    }

    @Override
    public ResponseEntity<DeviceTelemetrySnapshotDetails> recordSnapshot(
            String deviceId,
            RecordDeviceTelemetrySnapshotRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(telemetryService.recordSnapshot(deviceId, request));
    }

    @Override
    public ResponseEntity<TelemetryMetricSeries> getMetricTimeseries(
            String deviceId,
            String metricName,
            Instant start,
            Instant end
    ) {
        return ResponseEntity.ok(telemetryService.getMetricTimeseries(deviceId, metricName, start, end));
    }

    @Override
    public ResponseEntity<Map<String, Object>> recordTimeseriesPoints(
            String deviceId,
            List<RecordTelemetryPointRequest> requests
    ) {
        int count = telemetryService.recordTimeseriesPoints(deviceId, requests);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "status", "SUCCESS",
                "recordedCount", count
        ));
    }

    @Override
    public ResponseEntity<List<String>> getAvailableMetrics(String deviceId) {
        return ResponseEntity.ok(telemetryService.getAvailableMetrics(deviceId));
    }
}
