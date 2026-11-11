package com.gr2.noc.telemetry.repository;

import com.gr2.noc.telemetry.enums.OperStatus;
import com.gr2.noc.telemetry.model.DeviceTelemetrySnapshot;
import com.gr2.noc.telemetry.model.TelemetryTimeseriesPoint;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class TelemetryRepositoryIntegrationTest {

    @Autowired
    private DeviceTelemetryRepository telemetryRepository;

    @Autowired
    private TelemetryTimeseriesRepository timeseriesRepository;

    @Test
    @DisplayName("Should persist and retrieve latest device telemetry snapshot")
    void shouldPersistAndRetrieveLatestSnapshot() {
        Instant t1 = Instant.now().minus(10, ChronoUnit.MINUTES);
        Instant t2 = Instant.now();

        DeviceTelemetrySnapshot snap1 = DeviceTelemetrySnapshot.builder()
                .deviceId("SW-REPO-01")
                .collectedAt(t1)
                .operStatus(OperStatus.UP)
                .cpuPercent(30.0)
                .memoryPercent(45.0)
                .temperatureCelsius(40.0)
                .build();

        DeviceTelemetrySnapshot snap2 = DeviceTelemetrySnapshot.builder()
                .deviceId("SW-REPO-01")
                .collectedAt(t2)
                .operStatus(OperStatus.DEGRADED)
                .cpuPercent(85.0)
                .memoryPercent(70.0)
                .temperatureCelsius(55.0)
                .build();

        telemetryRepository.saveAll(List.of(snap1, snap2));

        DeviceTelemetrySnapshot latest = telemetryRepository
                .findTopByDeviceIdOrderByCollectedAtDesc("SW-REPO-01")
                .orElseThrow();

        assertThat(latest.getCpuPercent()).isEqualTo(85.0);
        assertThat(latest.getOperStatus()).isEqualTo(OperStatus.DEGRADED);
    }

    @Test
    @DisplayName("Should persist and query timeseries points and distinct metrics")
    void shouldPersistAndQueryTimeseriesAndDistinctMetrics() {
        Instant now = Instant.now();

        TelemetryTimeseriesPoint pt1 = TelemetryTimeseriesPoint.builder()
                .deviceId("SW-REPO-02")
                .metricName("CPU")
                .value(50.0)
                .unit("%")
                .timestamp(now.minus(20, ChronoUnit.MINUTES))
                .build();

        TelemetryTimeseriesPoint pt2 = TelemetryTimeseriesPoint.builder()
                .deviceId("SW-REPO-02")
                .metricName("CPU")
                .value(60.0)
                .unit("%")
                .timestamp(now.minus(5, ChronoUnit.MINUTES))
                .build();

        TelemetryTimeseriesPoint pt3 = TelemetryTimeseriesPoint.builder()
                .deviceId("SW-REPO-02")
                .metricName("TEMPERATURE")
                .value(48.0)
                .unit("°C")
                .timestamp(now.minus(5, ChronoUnit.MINUTES))
                .build();

        timeseriesRepository.saveAll(List.of(pt1, pt2, pt3));

        List<TelemetryTimeseriesPoint> cpuPoints = timeseriesRepository
                .findByDeviceIdAndMetricNameAndTimestampBetweenOrderByTimestampAsc(
                        "SW-REPO-02",
                        "CPU",
                        now.minus(30, ChronoUnit.MINUTES),
                        now
                );
        assertThat(cpuPoints).hasSize(2);
        assertThat(cpuPoints.get(0).getValue()).isEqualTo(50.0);
        assertThat(cpuPoints.get(1).getValue()).isEqualTo(60.0);

        List<String> distinctMetrics = timeseriesRepository.findDistinctMetricNamesByDeviceId("SW-REPO-02");
        assertThat(distinctMetrics).containsExactly("CPU", "TEMPERATURE");
    }
}
