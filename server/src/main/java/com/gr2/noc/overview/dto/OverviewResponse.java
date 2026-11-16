package com.gr2.noc.overview.dto;

import com.gr2.noc.incident.dto.get.IncidentSummary;
import lombok.Builder;

import java.util.List;

@Builder
public record OverviewResponse(
    HealthMetrics metrics,
    IncidentSummary topIncident,
    List<IncidentSummary> recentlyResolved
) {
}
