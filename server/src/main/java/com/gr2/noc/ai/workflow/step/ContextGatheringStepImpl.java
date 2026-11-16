package com.gr2.noc.ai.workflow.step;

import com.gr2.noc.ai.dto.InvestigationContext;
import com.gr2.noc.incident.dto.get.AlarmDetails;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.model.Alarm;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.IncidentRepository;
import com.gr2.noc.incident.service.IncidentService;
import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;
import com.gr2.noc.telemetry.service.TelemetryService;
import com.gr2.noc.topology.dto.get.TopologyGraph;
import com.gr2.noc.topology.service.TopologyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Shared implementation of the context gathering step: validates the incident and
 * assembles alarms, epicenter telemetry, and the 1-hop topology. Missing telemetry
 * or topology evidence degrades gracefully to null/empty instead of failing the run.
 */
@Service
@RequiredArgsConstructor
public class ContextGatheringStepImpl implements ContextGatheringStep {

    private static final String CPU_METRIC_NAME = "CPU";
    private static final int EPICENTER_HOP_COUNT = 1;

    private final IncidentService incidentService;
    private final IncidentRepository incidentRepository;
    private final TelemetryService telemetryService;
    private final TopologyService topologyService;

    @Override
    public InvestigationContext gather(String incidentId) {
        IncidentDetails incident = incidentService.getIncidentById(incidentId);
        return InvestigationContext.builder()
                .incident(incident)
                .alarms(loadAlarms(incidentId))
                .telemetrySnapshot(loadSnapshot(incident.primaryDeviceId()))
                .cpuTimeseries(loadCpuTimeseries(incident.primaryDeviceId(), incident.openedAt()))
                .epicenterTopology(loadEpicenterTopology(incident.primaryDeviceId()))
                .build();
    }

    private List<AlarmDetails> loadAlarms(String incidentId) {
        Optional<Incident> found = incidentRepository.findById(incidentId);
        if (found.isEmpty()) {
            return Collections.emptyList();
        }
        List<Alarm> alarms = found.get().getAlarms();
        return alarms != null
                ? alarms.stream().map(AlarmDetails::from).toList()
                : Collections.emptyList();
    }

    private DeviceTelemetrySnapshotDetails loadSnapshot(String deviceId) {
        if (isBlank(deviceId)) {
            return null;
        }
        try {
            return telemetryService.getLatestSnapshot(deviceId);
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                return null;
            }
            throw ex;
        }
    }

    private TelemetryMetricSeries loadCpuTimeseries(String deviceId, Instant openedAt) {
        if (isBlank(deviceId)) {
            return null;
        }
        try {
            Instant end = openedAt != null ? openedAt : Instant.now();
            Instant start = end.minus(Duration.ofHours(1));
            return telemetryService.getMetricTimeseries(deviceId, CPU_METRIC_NAME, start, end);
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                return null;
            }
            throw ex;
        }
    }

    private TopologyGraph loadEpicenterTopology(String primaryDeviceId) {
        if (isBlank(primaryDeviceId)) {
            return TopologyGraph.of(null, null);
        }
        try {
            return topologyService.getSubgraph(primaryDeviceId, null, EPICENTER_HOP_COUNT);
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                return TopologyGraph.of(null, null);
            }
            throw ex;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
