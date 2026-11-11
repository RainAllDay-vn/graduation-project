package com.gr2.noc.telemetry.config;

import com.gr2.noc.telemetry.enums.OperStatus;
import com.gr2.noc.telemetry.model.DeviceTelemetrySnapshot;
import com.gr2.noc.telemetry.model.TelemetryTimeseriesPoint;
import com.gr2.noc.telemetry.repository.DeviceTelemetryRepository;
import com.gr2.noc.telemetry.repository.TelemetryTimeseriesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Initializes sample device telemetry snapshots and timeseries metrics for development.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class TelemetryDataInitializer implements CommandLineRunner {

    private final DeviceTelemetryRepository telemetryRepository;
    private final TelemetryTimeseriesRepository timeseriesRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (telemetryRepository.count() > 0) {
            log.info("Telemetry seed data already exists. Skipping initialization.");
            return;
        }

        log.info("Seeding initial device telemetry data (SW-HN-02, CORE-DN-01)...");
        Instant now = Instant.now();

        // 1. Snapshot for SW-HN-02 (Degraded device in Incident INC-2026-0915)
        DeviceTelemetrySnapshot swHn02Snapshot = DeviceTelemetrySnapshot.builder()
                .deviceId("SW-HN-02")
                .collectedAt(now)
                .operStatus(OperStatus.DEGRADED)
                .uptimeSeconds(3636000L) // ~42 days
                .loadPercentage(34.0)
                .routesLearned(1284)
                .routesUsed(976)
                .cpuPercent(78.5)
                .memoryPercent(62.1)
                .temperatureCelsius(52.0)
                .build();

        // 2. Snapshot for CORE-DN-01 (Congested uplink in Incident INC-2026-0916)
        DeviceTelemetrySnapshot coreDn01Snapshot = DeviceTelemetrySnapshot.builder()
                .deviceId("CORE-DN-01")
                .collectedAt(now)
                .operStatus(OperStatus.UP)
                .uptimeSeconds(7800000L)
                .loadPercentage(94.2)
                .routesLearned(4510)
                .routesUsed(4120)
                .cpuPercent(45.0)
                .memoryPercent(58.3)
                .temperatureCelsius(44.0)
                .build();

        telemetryRepository.saveAll(List.of(swHn02Snapshot, coreDn01Snapshot));

        // 3. Timeseries points for SW-HN-02: CPU and Temperature over the last 60 minutes
        List<TelemetryTimeseriesPoint> points = new ArrayList<>();
        double[] cpuValues = {35.0, 38.2, 41.0, 52.5, 68.0, 74.2, 78.5};
        double[] tempValues = {42.0, 43.5, 45.0, 47.2, 49.8, 51.2, 52.0};

        for (int i = 0; i < cpuValues.length; i++) {
            Instant ptTime = now.minus((cpuValues.length - 1 - i) * 10L, ChronoUnit.MINUTES);
            points.add(TelemetryTimeseriesPoint.builder()
                    .deviceId("SW-HN-02")
                    .metricName("CPU")
                    .value(cpuValues[i])
                    .unit("%")
                    .timestamp(ptTime)
                    .build());
            points.add(TelemetryTimeseriesPoint.builder()
                    .deviceId("SW-HN-02")
                    .metricName("TEMPERATURE")
                    .value(tempValues[i])
                    .unit("°C")
                    .timestamp(ptTime)
                    .build());
        }

        timeseriesRepository.saveAll(points);
        log.info("Successfully seeded telemetry snapshots and {} timeseries points.", points.size());
    }
}
