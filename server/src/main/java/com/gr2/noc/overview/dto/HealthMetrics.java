package com.gr2.noc.overview.dto;

import lombok.Builder;

@Builder
public record HealthMetrics(
    int nodesUp,
    int nodesTotal,
    int nodesWarning,
    int nodesCritical,
    int openAlarms,
    int openIncidents,
    int portsDown
) {
}
