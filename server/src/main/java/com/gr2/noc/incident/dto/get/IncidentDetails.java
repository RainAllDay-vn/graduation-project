package com.gr2.noc.incident.dto.get;

import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Incident;
import lombok.Builder;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Builder
public record IncidentDetails(
    String id,
    String title,
    String description,
    IncidentStatus status,
    Severity severity,
    String region,
    String primaryDeviceId,
    Instant openedAt,
    Instant resolvedAt,
    int alarmCount,
    List<AlarmSummary> alarms,
    Instant createdAt,
    Instant updatedAt
) {
    public static IncidentDetails from(Incident incident) {
        if (incident == null) {
            return null;
        }
        List<AlarmSummary> alarmSummaries = incident.getAlarms() != null
                ? incident.getAlarms().stream().map(AlarmSummary::from).toList()
                : Collections.emptyList();

        return IncidentDetails.builder()
                .id(incident.getId())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .status(incident.getStatus())
                .severity(incident.getSeverity())
                .region(incident.getRegion())
                .primaryDeviceId(incident.getPrimaryDeviceId())
                .openedAt(incident.getOpenedAt())
                .resolvedAt(incident.getResolvedAt())
                .alarmCount(incident.getAlarms() != null ? incident.getAlarms().size() : 0)
                .alarms(alarmSummaries)
                .createdAt(incident.getCreatedAt())
                .updatedAt(incident.getUpdatedAt())
                .build();
    }
}
