package com.gr2.noc.telemetry.dto.get;

import com.gr2.noc.telemetry.model.TelemetryTimeseriesPoint;
import lombok.Builder;

import java.time.Instant;

@Builder
public record TelemetryTimeseriesPointDetails(
    Instant timestamp,
    Double value,
    String unit
) {
    public static TelemetryTimeseriesPointDetails from(TelemetryTimeseriesPoint point) {
        if (point == null) {
            return null;
        }
        return TelemetryTimeseriesPointDetails.builder()
                .timestamp(point.getTimestamp())
                .value(point.getValue())
                .unit(point.getUnit())
                .build();
    }
}
