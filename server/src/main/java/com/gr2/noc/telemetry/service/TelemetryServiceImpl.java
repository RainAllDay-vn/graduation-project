package com.gr2.noc.telemetry.service;

import com.gr2.noc.telemetry.dto.create.RecordDeviceTelemetrySnapshotRequest;
import com.gr2.noc.telemetry.dto.create.RecordTelemetryPointRequest;
import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;
import com.gr2.noc.telemetry.model.DeviceTelemetrySnapshot;
import com.gr2.noc.telemetry.model.TelemetryTimeseriesPoint;
import com.gr2.noc.telemetry.repository.DeviceTelemetryRepository;
import com.gr2.noc.telemetry.repository.TelemetryTimeseriesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TelemetryServiceImpl implements TelemetryService {

    private final DeviceTelemetryRepository telemetryRepository;
    private final TelemetryTimeseriesRepository timeseriesRepository;

    @Override
    public DeviceTelemetrySnapshotDetails getLatestSnapshot(String deviceId) {
        return telemetryRepository.findTopByDeviceIdOrderByCollectedAtDesc(deviceId)
                .map(DeviceTelemetrySnapshotDetails::from)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No telemetry snapshot found for device: " + deviceId
                ));
    }

    @Override
    public TelemetryMetricSeries getMetricTimeseries(String deviceId, String metricName, Instant start, Instant end) {
        Instant effectiveEnd = (end != null) ? end : Instant.now();
        Instant effectiveStart = (start != null) ? start : effectiveEnd.minus(1, ChronoUnit.HOURS);

        if (effectiveStart.isAfter(effectiveEnd)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Start timestamp must be before end timestamp"
            );
        }

        List<TelemetryTimeseriesPoint> points = timeseriesRepository
                .findByDeviceIdAndMetricNameAndTimestampBetweenOrderByTimestampAsc(
                        deviceId,
                        metricName,
                        effectiveStart,
                        effectiveEnd
                );

        return TelemetryMetricSeries.from(deviceId, metricName, points);
    }

    @Override
    @Transactional
    public DeviceTelemetrySnapshotDetails recordSnapshot(String deviceId, RecordDeviceTelemetrySnapshotRequest request) {
        DeviceTelemetrySnapshot snapshot = DeviceTelemetrySnapshot.builder()
                .deviceId(deviceId)
                .collectedAt(request.collectedAt() != null ? request.collectedAt() : Instant.now())
                .operStatus(request.operStatus())
                .uptimeSeconds(request.uptimeSeconds())
                .loadPercentage(request.loadPercentage())
                .routesLearned(request.routesLearned())
                .routesUsed(request.routesUsed())
                .cpuPercent(request.cpuPercent())
                .memoryPercent(request.memoryPercent())
                .temperatureCelsius(request.temperatureCelsius())
                .build();
        if (snapshot == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to record telemetry snapshot");
        }

        DeviceTelemetrySnapshot saved = telemetryRepository.save(snapshot);
        return DeviceTelemetrySnapshotDetails.from(saved);
    }

    @Override
    @Transactional
    public int recordTimeseriesPoints(String deviceId, List<RecordTelemetryPointRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return 0;
        }

        Instant fallbackTime = Instant.now();
        List<TelemetryTimeseriesPoint> entities = requests.stream().map(req -> TelemetryTimeseriesPoint.builder()
                .deviceId(deviceId)
                .metricName(req.metricName())
                .value(req.value())
                .unit(req.unit())
                .timestamp(req.timestamp() != null ? req.timestamp() : fallbackTime)
                .build()
        ).toList();

        timeseriesRepository.saveAll(entities);
        return entities.size();
    }

    @Override
    public List<String> getAvailableMetrics(String deviceId) {
        return timeseriesRepository.findDistinctMetricNamesByDeviceId(deviceId);
    }
}
