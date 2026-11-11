package com.gr2.noc.telemetry.dto.get;

import com.gr2.noc.telemetry.enums.OperStatus;
import com.gr2.noc.telemetry.model.DeviceTelemetrySnapshot;
import lombok.Builder;

import java.time.Instant;

@Builder
public record DeviceTelemetrySnapshotDetails(
    String deviceId,
    Instant collectedAt,
    OperStatus operStatus,
    Long uptimeSeconds,
    Double loadPercentage,
    Integer routesLearned,
    Integer routesUsed,
    Double cpuPercent,
    Double memoryPercent,
    Double temperatureCelsius
) {
    public static DeviceTelemetrySnapshotDetails from(DeviceTelemetrySnapshot snapshot) {
        if (snapshot == null) {
            return null;
        }
        return DeviceTelemetrySnapshotDetails.builder()
                .deviceId(snapshot.getDeviceId())
                .collectedAt(snapshot.getCollectedAt())
                .operStatus(snapshot.getOperStatus())
                .uptimeSeconds(snapshot.getUptimeSeconds())
                .loadPercentage(snapshot.getLoadPercentage())
                .routesLearned(snapshot.getRoutesLearned())
                .routesUsed(snapshot.getRoutesUsed())
                .cpuPercent(snapshot.getCpuPercent())
                .memoryPercent(snapshot.getMemoryPercent())
                .temperatureCelsius(snapshot.getTemperatureCelsius())
                .build();
    }
}
