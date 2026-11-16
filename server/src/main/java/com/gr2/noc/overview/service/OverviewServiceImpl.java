package com.gr2.noc.overview.service;

import com.gr2.noc.incident.dto.get.IncidentSummary;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.model.Alarm;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.IncidentRepository;
import com.gr2.noc.overview.dto.HealthMetrics;
import com.gr2.noc.overview.dto.OverviewResponse;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.model.NetworkDevice;
import com.gr2.noc.topology.model.NetworkLink;
import com.gr2.noc.topology.repository.NetworkDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OverviewServiceImpl implements OverviewService {

    private static final double DEGRADED_RX_THRESHOLD_DBM = -20.0;
    private static final int RECENTLY_RESOLVED_LIMIT = 5;

    private final NetworkDeviceRepository deviceRepository;
    private final IncidentRepository incidentRepository;

    @Override
    @Transactional(readOnly = true)
    public OverviewResponse getOverview() {
        List<NetworkDevice> devices = deviceRepository.findAllWithLinks();
        if (devices == null) {
            devices = Collections.emptyList();
        }

        int nodesTotal = devices.size();
        int nodesUp = 0;
        int nodesWarning = 0;
        int nodesCritical = 0;
        Set<String> seenLinkIds = new HashSet<>();
        int portsDown = 0;

        for (NetworkDevice device : devices) {
            if (device.getStatus() == DeviceStatus.ACTIVE) {
                nodesUp++;
            } else if (device.getStatus() == DeviceStatus.DEGRADED) {
                nodesWarning++;
            } else if (device.getStatus() == DeviceStatus.CRITICAL) {
                nodesCritical++;
            }

            List<NetworkLink> links = device.getLinks();
            if (links == null) {
                continue;
            }
            for (NetworkLink link : links) {
                if (!seenLinkIds.add(link.getLinkId())) {
                    continue;
                }
                if (isPortDown(link)) {
                    portsDown++;
                }
            }
        }

        List<Incident> incidents = incidentRepository.findAllByOrderByCreatedAtDesc();
        if (incidents == null) {
            incidents = Collections.emptyList();
        }

        IncidentSummary topIncident = null;
        int openIncidents = 0;
        int openAlarms = 0;
        List<Incident> resolved = new ArrayList<>();

        for (Incident incident : incidents) {
            if (incident.getStatus() == IncidentStatus.RESOLVED) {
                resolved.add(incident);
            } else {
                if (topIncident == null) {
                    topIncident = IncidentSummary.from(incident);
                }
                openIncidents++;
                List<Alarm> alarms = incident.getAlarms();
                openAlarms += alarms != null ? alarms.size() : 0;
            }
        }

        resolved.sort((a, b) -> {
            Instant aAt = a.getResolvedAt();
            Instant bAt = b.getResolvedAt();
            if (aAt == null && bAt == null) {
                return 0;
            }
            if (aAt == null) {
                return 1;
            }
            if (bAt == null) {
                return -1;
            }
            return bAt.compareTo(aAt);
        });

        List<IncidentSummary> recentlyResolved = resolved.stream()
                .limit(RECENTLY_RESOLVED_LIMIT)
                .map(IncidentSummary::from)
                .toList();

        HealthMetrics metrics = HealthMetrics.builder()
                .nodesUp(nodesUp)
                .nodesTotal(nodesTotal)
                .nodesWarning(nodesWarning)
                .nodesCritical(nodesCritical)
                .openAlarms(openAlarms)
                .openIncidents(openIncidents)
                .portsDown(portsDown)
                .build();

        return OverviewResponse.builder()
                .metrics(metrics)
                .topIncident(topIncident)
                .recentlyResolved(recentlyResolved)
                .build();
    }

    private boolean isPortDown(NetworkLink link) {
        if (link == null) {
            return false;
        }
        String operStatus = link.getOperStatus();
        if ("DOWN".equalsIgnoreCase(operStatus) || "DEGRADED".equalsIgnoreCase(operStatus)) {
            return true;
        }
        Double rxPowerDbm = link.getRxPowerDbm();
        return rxPowerDbm != null && rxPowerDbm < DEGRADED_RX_THRESHOLD_DBM;
    }
}
