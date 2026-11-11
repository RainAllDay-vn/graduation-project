package com.gr2.noc.telemetry.dto.get;

import com.gr2.noc.telemetry.model.TelemetryTimeseriesPoint;
import lombok.Builder;

import java.util.Collections;
import java.util.List;

@Builder
public record TelemetryMetricSeries(
    String deviceId,
    String metricName,
    String unit,
    List<TelemetryTimeseriesPointDetails> points
) {
    public static TelemetryMetricSeries from(
            String deviceId,
            String metricName,
            List<TelemetryTimeseriesPoint> points
    ) {
        String unit = (points != null && !points.isEmpty()) ? points.get(0).getUnit() : null;
        List<TelemetryTimeseriesPointDetails> pointDtos = (points != null)
                ? points.stream().map(TelemetryTimeseriesPointDetails::from).toList()
                : Collections.emptyList();

        return TelemetryMetricSeries.builder()
                .deviceId(deviceId)
                .metricName(metricName)
                .unit(unit)
                .points(pointDtos)
                .build();
    }
}
