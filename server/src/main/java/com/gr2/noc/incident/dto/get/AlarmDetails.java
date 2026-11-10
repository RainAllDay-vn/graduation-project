package com.gr2.noc.incident.dto.get;

import com.gr2.noc.incident.enums.AlarmType;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Alarm;
import lombok.Builder;

import java.time.Instant;

@Builder
public record AlarmDetails(
    String id,
    String incidentId,
    String deviceId,
    Instant timestamp,
    Severity severity,
    AlarmType alarmType,
    String faultCode,
    String message,
    boolean isCurrentIncident
) {
    public static AlarmDetails from(Alarm alarm) {
        if (alarm == null) {
            return null;
        }
        return AlarmDetails.builder()
                .id(alarm.getId())
                .incidentId(alarm.getIncident() != null ? alarm.getIncident().getId() : null)
                .deviceId(alarm.getDeviceId())
                .timestamp(alarm.getTimestamp())
                .severity(alarm.getSeverity())
                .alarmType(alarm.getAlarmType())
                .faultCode(alarm.getFaultCode())
                .message(alarm.getMessage())
                .isCurrentIncident(alarm.isCurrentIncident())
                .build();
    }
}
