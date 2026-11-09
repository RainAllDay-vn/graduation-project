package com.gr2.noc.telemetry.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "telemetry_timeseries", indexes = {
    @Index(name = "idx_ts_device_metric_time", columnList = "device_id, metric_name, timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemetryTimeseriesPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false, length = 64)
    private String deviceId;

    @Column(name = "metric_name", nullable = false, length = 64)
    private String metricName; // e.g. "CPU", "MEMORY", "TEMPERATURE", "PACKET_ERROR"

    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "metric_value", nullable = false)
    private Double value;

    @Column(length = 32)
    private String unit; // e.g. "%", "°C", "CRC/min"
}
