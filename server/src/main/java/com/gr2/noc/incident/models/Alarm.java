package com.gr2.noc.incident.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gr2.noc.incident.enums.AlarmType;
import com.gr2.noc.incident.enums.Severity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "alarms", indexes = {
    @Index(name = "idx_alarms_device_id", columnList = "device_id"),
    @Index(name = "idx_alarms_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alarm {

    @Id
    @Column(length = 64)
    private String id; // e.g. "ALM-2035"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id")
    @JsonIgnore
    private Incident incident;

    @Column(name = "device_id", nullable = false, length = 64)
    private String deviceId; // e.g. "SW-HN-02" or "CORE-02"

    @Column(nullable = false)
    private Instant timestamp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private Severity severity = Severity.WARNING;

    @Enumerated(EnumType.STRING)
    @Column(name = "alarm_type", nullable = false, length = 32)
    @Builder.Default
    private AlarmType alarmType = AlarmType.FAULT_CODE;

    @Column(name = "fault_code", length = 64)
    private String faultCode; // e.g. "OPTICS_TEMP_HIGH", "CRC_ERROR_THRESHOLD", "BGP_FLAP"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "is_current_incident", nullable = false)
    @Builder.Default
    private boolean isCurrentIncident = true; // Stylebook 5.2: red/yellow for current incident, gray for non-current
}
