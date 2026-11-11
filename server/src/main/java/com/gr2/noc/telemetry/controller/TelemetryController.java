package com.gr2.noc.telemetry.controller;

import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;
import com.gr2.noc.telemetry.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequiredArgsConstructor
public class TelemetryController implements TelemetryApi {

    private final TelemetryService telemetryService;

    @Override
    public ResponseEntity<DeviceTelemetrySnapshotDetails> getLatestSnapshot(String deviceId) {
        return ResponseEntity.ok(telemetryService.getLatestSnapshot(deviceId));
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
}
