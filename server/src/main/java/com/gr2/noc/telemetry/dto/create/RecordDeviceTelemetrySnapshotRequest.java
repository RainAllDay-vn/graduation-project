package com.gr2.noc.telemetry.dto.create;

import com.gr2.noc.telemetry.enums.OperStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.Instant;

@Builder
public record RecordDeviceTelemetrySnapshotRequest(
    Instant collectedAt,

    @NotNull(message = "Operational status must not be null")
    OperStatus operStatus,

    Long uptimeSeconds,
    Double loadPercentage,
    Integer routesLearned,
    Integer routesUsed,
    Double cpuPercent,
    Double memoryPercent,
    Double temperatureCelsius
) {
}
