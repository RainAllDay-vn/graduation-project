package com.gr2.noc.ai.dto;

import com.gr2.noc.incident.dto.get.AlarmDetails;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.rag.dto.TechnicalDocSnippet;
import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;
import com.gr2.noc.topology.dto.get.TopologyGraph;
import lombok.Builder;

import java.util.Collections;
import java.util.List;

/**
 * Multi-source evidence bundle assembled during an AI investigation:
 * the incident, its alarms, epicenter telemetry, the 1-hop topology,
 * and (after the knowledge retrieval step) the matched SOP/Runbook snippets.
 */
@Builder
public record InvestigationContext(
    IncidentDetails incident,
    List<AlarmDetails> alarms,
    DeviceTelemetrySnapshotDetails telemetrySnapshot,
    TelemetryMetricSeries cpuTimeseries,
    TopologyGraph epicenterTopology,
    List<TechnicalDocSnippet> runbooks
) {
    public InvestigationContext {
        alarms = alarms != null ? alarms : Collections.emptyList();
        runbooks = runbooks != null ? runbooks : Collections.emptyList();
    }

    public InvestigationContext withRunbooks(List<TechnicalDocSnippet> newRunbooks) {
        return new InvestigationContext(
            incident,
            alarms,
            telemetrySnapshot,
            cpuTimeseries,
            epicenterTopology,
            newRunbooks
        );
    }
}
