package com.gr2.noc.telemetry.models;

import com.gr2.noc.telemetry.enums.OperStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "device_telemetry_snapshots", indexes = {
    @Index(name = "idx_telemetry_device_id", columnList = "device_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceTelemetrySnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false, length = 64)
    private String deviceId;

    @Column(name = "collected_at", nullable = false)
    private Instant collectedAt; // Mốc dữ liệu đáng tin cậy đến thời điểm này (Stylebook 5.3)

    @Enumerated(EnumType.STRING)
    @Column(name = "oper_status", nullable = false, length = 32)
    @Builder.Default
    private OperStatus operStatus = OperStatus.UP;

    @Column(name = "uptime_seconds")
    private Long uptimeSeconds; // Thời gian chạy liên tục (e.g. 42 ngày 2 giờ)

    @Column(name = "load_percentage")
    private Double loadPercentage; // Mức tải (e.g. 34.0%)

    @Column(name = "routes_learned")
    private Integer routesLearned; // e.g. 1284

    @Column(name = "routes_used")
    private Integer routesUsed; // e.g. 976

    @Column(name = "cpu_percent")
    private Double cpuPercent; // e.g. 23.0%

    @Column(name = "memory_percent")
    private Double memoryPercent; // e.g. 61.0%

    @Column(name = "temperature_celsius")
    private Double temperatureCelsius; // e.g. 48.0°C
}
