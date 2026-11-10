package com.gr2.noc.incident.dto.get;

import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Incident;
import lombok.Builder;

import java.time.Instant;

@Builder
public record IncidentSummary(
    String id,
    String title,
    IncidentStatus status,
    Severity severity,
    String region,
    String primaryDeviceId,
    Instant openedAt,
    int alarmCount
) {
    public static IncidentSummary from(Incident incident) {
        if (incident == null) {
            return null;
        }
        return IncidentSummary.builder()
                .id(incident.getId())
                .title(incident.getTitle())
                .status(incident.getStatus())
                .severity(incident.getSeverity())
                .region(incident.getRegion())
                .primaryDeviceId(incident.getPrimaryDeviceId())
                .openedAt(incident.getOpenedAt())
                .alarmCount(incident.getAlarms() != null ? incident.getAlarms().size() : 0)
                .build();
    }
}
