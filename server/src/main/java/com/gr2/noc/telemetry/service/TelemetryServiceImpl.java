package com.gr2.noc.telemetry.service;

import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;
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
}
