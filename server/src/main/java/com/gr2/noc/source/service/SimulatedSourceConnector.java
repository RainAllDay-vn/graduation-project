package com.gr2.noc.source.service;

import com.gr2.noc.source.dto.get.TestConnectionResult;
import com.gr2.noc.source.enums.SourceAuthType;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.ingest.IngestResult;
import com.gr2.noc.source.ingest.SourceIngestionService;
import com.gr2.noc.source.model.ExternalSource;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@ConditionalOnProperty(name = "app.sources.sync.simulated", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class SimulatedSourceConnector implements SourceConnector {

    private final SourceIngestionService ingestionService;

    @Override
    public TestConnectionResult testConnection(ExternalSource source) {
        String failure = missingTokenMessage(source);
        if (failure != null) {
            return TestConnectionResult.builder().success(false).message(failure).build();
        }
        long latencyMs = 60 + Math.floorMod(source.getId().hashCode(), 140);
        String message = source.getType() == SourceType.MQ
                ? "Kết nối broker thành công (mô phỏng)"
                : "Kết nối REST thành công (mô phỏng)";
        return TestConnectionResult.builder().success(true).message(message).latencyMs(latencyMs).build();
    }

    @Override
    public SyncFetchResult fetch(ExternalSource source, Instant since) {
        String failure = missingTokenMessage(source);
        if (failure != null) {
            return SyncFetchResult.failed(failure);
        }
        int seed = Math.abs(source.getId().hashCode());
        String deviceId = "DEV-SIM-" + (1 + Math.floorMod(seed, 6));
        Instant now = Instant.now().truncatedTo(ChronoUnit.SECONDS);

        long ingested = 0;
        int failedMessages = 0;
        String firstError = null;
        for (String raw : sampleMessages(deviceId, seed, now)) {
            IngestResult result = ingestionService.ingest(raw);
            if (result.success()) {
                ingested += result.recordsIngested();
            } else {
                failedMessages++;
                if (firstError == null) {
                    firstError = result.message();
                }
            }
        }
        if (failedMessages > 0) {
            return SyncFetchResult.failed("Thông điệp mô phỏng xử lý thất bại: " + firstError);
        }
        return SyncFetchResult.success(ingested, 0);
    }

    private List<String> sampleMessages(String deviceId, int seed, Instant now) {
        int cpu = 35 + Math.floorMod(seed, 55);
        int temperature = 40 + Math.floorMod(seed, 35);
        int routes = 12 + Math.floorMod(seed, 40);
        String snapshot = """
                {
                  "type": "telemetry.snapshot",
                  "occurredAt": "%s",
                  "payload": {
                    "deviceId": "%s",
                    "operStatus": "UP",
                    "uptimeSeconds": %d,
                    "loadPercentage": %d.0,
                    "routesLearned": %d,
                    "routesUsed": %d,
                    "cpuPercent": %d.5,
                    "memoryPercent": %d.0,
                    "temperatureCelsius": %d.0
                  }
                }
                """.formatted(now, deviceId, 3600 + Math.floorMod(seed, 7200), cpu,
                routes, Math.max(1, routes - 2), cpu, 40 + Math.floorMod(seed, 30), temperature);
        String points = """
                {
                  "type": "telemetry.points",
                  "payload": {
                    "deviceId": "%s",
                    "metricName": "latency_ms",
                    "unit": "ms",
                    "points": [
                      {"timestamp": "%s", "value": %d.0},
                      {"timestamp": "%s", "value": %d.0},
                      {"timestamp": "%s", "value": %d.0}
                    ]
                  }
                }
                """.formatted(deviceId, now, 5 + Math.floorMod(seed, 20),
                now.minusSeconds(60), 6 + Math.floorMod(seed, 25),
                now.minusSeconds(120), 4 + Math.floorMod(seed, 30));
        String alarm = """
                {
                  "type": "alarm",
                  "occurredAt": "%s",
                  "payload": {
                    "deviceId": "%s",
                    "faultCode": "SIM_LINK_FLAP",
                    "severity": "WARNING",
                    "timestamp": "%s",
                    "message": "Cảnh báo mô phỏng cho nguồn đồng bộ"
                  }
                }
                """.formatted(now, deviceId, now);
        return List.of(snapshot, points, alarm);
    }

    private String missingTokenMessage(ExternalSource source) {
        if (source.getAuthType() != null
                && source.getAuthType() != SourceAuthType.NONE
                && (source.getAuthToken() == null || source.getAuthToken().isBlank())) {
            return "Token xác thực chưa được cấu hình hoặc đã hết hạn";
        }
        return null;
    }
}
