package com.gr2.noc.telemetry.dto.create;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.Instant;

@Builder
public record RecordTelemetryPointRequest(
    @NotBlank(message = "Metric name must not be blank")
    String metricName,

    @NotNull(message = "Metric value must not be null")
    Double value,

    String unit,

    Instant timestamp
) {
}
