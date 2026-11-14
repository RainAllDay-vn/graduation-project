package com.gr2.noc.telemetry.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.telemetry.dto.create.RecordDeviceTelemetrySnapshotRequest;
import com.gr2.noc.telemetry.dto.create.RecordTelemetryPointRequest;
import com.gr2.noc.telemetry.enums.OperStatus;
import com.gr2.noc.telemetry.model.DeviceTelemetrySnapshot;
import com.gr2.noc.telemetry.model.TelemetryTimeseriesPoint;
import com.gr2.noc.telemetry.repository.DeviceTelemetryRepository;
import com.gr2.noc.telemetry.repository.TelemetryTimeseriesRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
@Transactional
class TelemetryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DeviceTelemetryRepository telemetryRepository;

    @Autowired
    private TelemetryTimeseriesRepository timeseriesRepository;

    @Nested
    @DisplayName("GET /api/devices/{deviceId}/telemetry/snapshot")
    class GetLatestSnapshotTests {

        @Test
        @DisplayName("Should return 200 OK with latest snapshot details")
        void shouldReturnLatestSnapshot() throws Exception {
            DeviceTelemetrySnapshot snapshot = DeviceTelemetrySnapshot.builder()
                    .deviceId("SW-HN-02")
                    .collectedAt(Instant.now())
                    .operStatus(OperStatus.DEGRADED)
                    .uptimeSeconds(3636000L)
                    .loadPercentage(34.0)
                    .cpuPercent(78.5)
                    .memoryPercent(62.1)
                    .temperatureCelsius(52.0)
                    .routesLearned(1284)
                    .routesUsed(976)
                    .build();

            telemetryRepository.save(snapshot);

            mockMvc.perform(get("/api/devices/{deviceId}/telemetry/snapshot", "SW-HN-02"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.deviceId", is("SW-HN-02")))
                    .andExpect(jsonPath("$.operStatus", is("DEGRADED")))
                    .andExpect(jsonPath("$.cpuPercent", is(78.5)))
                    .andExpect(jsonPath("$.temperatureCelsius", is(52.0)))
                    .andExpect(jsonPath("$.routesLearned", is(1284)));
        }

        @Test
        @DisplayName("Should return 404 Not Found when no snapshot exists for device")
        void shouldReturn404WhenSnapshotNotFound() throws Exception {
            mockMvc.perform(get("/api/devices/{deviceId}/telemetry/snapshot", "UNKNOWN-DEVICE"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/devices/{deviceId}/telemetry/snapshot")
    class RecordSnapshotTests {

        @Test
        @DisplayName("Should return 201 Created when snapshot request is valid")
        void shouldRecordSnapshotSuccessfully() throws Exception {
            RecordDeviceTelemetrySnapshotRequest request = RecordDeviceTelemetrySnapshotRequest.builder()
                    .operStatus(OperStatus.UP)
                    .uptimeSeconds(100000L)
                    .loadPercentage(25.0)
                    .cpuPercent(32.0)
                    .memoryPercent(48.0)
                    .temperatureCelsius(41.5)
                    .routesLearned(500)
                    .routesUsed(450)
                    .build();

            mockMvc.perform(post("/api/devices/{deviceId}/telemetry/snapshot", "SW-INGEST-01")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.deviceId", is("SW-INGEST-01")))
                    .andExpect(jsonPath("$.operStatus", is("UP")))
                    .andExpect(jsonPath("$.cpuPercent", is(32.0)));

            assertThat(telemetryRepository.findTopByDeviceIdOrderByCollectedAtDesc("SW-INGEST-01")).isPresent();
        }

        @Test
        @DisplayName("Should return 400 Bad Request when operStatus is null")
        void shouldReturn400WhenOperStatusNull() throws Exception {
            mockMvc.perform(post("/api/devices/{deviceId}/telemetry/snapshot", "SW-INGEST-02")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"operStatus\": null}"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/devices/{deviceId}/telemetry/timeseries")
    class GetMetricTimeseriesTests {

        @Test
        @DisplayName("Should return 200 OK with metric series and points")
        void shouldReturnTimeseriesPoints() throws Exception {
            Instant now = Instant.now();

            TelemetryTimeseriesPoint pt1 = TelemetryTimeseriesPoint.builder()
                    .deviceId("SW-TEST-TIMESERIES")
                    .metricName("CPU")
                    .value(65.0)
                    .unit("%")
                    .timestamp(now.minus(30, ChronoUnit.MINUTES))
                    .build();

            TelemetryTimeseriesPoint pt2 = TelemetryTimeseriesPoint.builder()
                    .deviceId("SW-TEST-TIMESERIES")
                    .metricName("CPU")
                    .value(78.5)
                    .unit("%")
                    .timestamp(now.minus(10, ChronoUnit.MINUTES))
                    .build();

            timeseriesRepository.saveAll(List.of(pt1, pt2));

            mockMvc.perform(get("/api/devices/{deviceId}/telemetry/timeseries", "SW-TEST-TIMESERIES")
                            .param("metricName", "CPU")
                            .param("start", now.minus(1, ChronoUnit.HOURS).toString())
                            .param("end", now.toString()))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.deviceId", is("SW-TEST-TIMESERIES")))
                    .andExpect(jsonPath("$.metricName", is("CPU")))
                    .andExpect(jsonPath("$.unit", is("%")))
                    .andExpect(jsonPath("$.points", hasSize(2)))
                    .andExpect(jsonPath("$.points[0].value", is(65.0)))
                    .andExpect(jsonPath("$.points[1].value", is(78.5)));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when start timestamp is after end timestamp")
        void shouldReturn400WhenStartIsAfterEnd() throws Exception {
            Instant now = Instant.now();

            mockMvc.perform(get("/api/devices/{deviceId}/telemetry/timeseries", "SW-HN-02")
                            .param("metricName", "CPU")
                            .param("start", now.toString())
                            .param("end", now.minus(1, ChronoUnit.HOURS).toString()))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("POST /api/devices/{deviceId}/telemetry/timeseries")
    class RecordTimeseriesTests {

        @Test
        @DisplayName("Should return 201 Created when batch timeseries points are recorded")
        void shouldRecordTimeseriesPointsSuccessfully() throws Exception {
            RecordTelemetryPointRequest p1 = RecordTelemetryPointRequest.builder()
                    .metricName("CPU")
                    .value(44.0)
                    .unit("%")
                    .timestamp(Instant.now().minus(5, ChronoUnit.MINUTES))
                    .build();

            RecordTelemetryPointRequest p2 = RecordTelemetryPointRequest.builder()
                    .metricName("CPU")
                    .value(55.0)
                    .unit("%")
                    .timestamp(Instant.now())
                    .build();

            mockMvc.perform(post("/api/devices/{deviceId}/telemetry/timeseries", "SW-INGEST-03")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(List.of(p1, p2))))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status", is("SUCCESS")))
                    .andExpect(jsonPath("$.recordedCount", is(2)));

            List<TelemetryTimeseriesPoint> points = timeseriesRepository
                    .findByDeviceIdAndMetricNameAndTimestampBetweenOrderByTimestampAsc(
                            "SW-INGEST-03", "CPU", Instant.now().minus(1, ChronoUnit.HOURS), Instant.now().plus(1, ChronoUnit.MINUTES)
                    );
            assertThat(points).hasSize(2);
        }
    }

    @Nested
    @DisplayName("GET /api/devices/{deviceId}/telemetry/metrics")
    class GetAvailableMetricsTests {

        @Test
        @DisplayName("Should return 200 OK with distinct list of metric names")
        void shouldReturnAvailableMetrics() throws Exception {
            TelemetryTimeseriesPoint pt1 = TelemetryTimeseriesPoint.builder()
                    .deviceId("SW-METRICS-01")
                    .metricName("CPU")
                    .value(50.0)
                    .timestamp(Instant.now())
                    .build();

            TelemetryTimeseriesPoint pt2 = TelemetryTimeseriesPoint.builder()
                    .deviceId("SW-METRICS-01")
                    .metricName("TEMPERATURE")
                    .value(45.0)
                    .timestamp(Instant.now())
                    .build();

            timeseriesRepository.saveAll(List.of(pt1, pt2));

            mockMvc.perform(get("/api/devices/{deviceId}/telemetry/metrics", "SW-METRICS-01"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$", containsInAnyOrder("CPU", "TEMPERATURE")));
        }
    }
}
