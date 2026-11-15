package com.gr2.noc.incident.service;

import com.gr2.noc.incident.dto.create.CreateIncidentRequest;
import com.gr2.noc.incident.dto.get.AlarmDetails;
import com.gr2.noc.incident.dto.get.AlarmSummary;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.dto.get.IncidentSummary;
import com.gr2.noc.incident.dto.update.UpdateIncidentStatusRequest;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.AlarmRepository;
import com.gr2.noc.incident.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final AlarmRepository alarmRepository;

    @Override
    public List<IncidentSummary> getIncidents(IncidentStatus status, Severity severity) {
        List<Incident> incidents;
        if (status != null && severity != null) {
            incidents = incidentRepository.findByStatusAndSeverityOrderByCreatedAtDesc(status, severity);
        } else if (status != null) {
            incidents = incidentRepository.findByStatusOrderByCreatedAtDesc(status);
        } else if (severity != null) {
            incidents = incidentRepository.findBySeverityOrderByCreatedAtDesc(severity);
        } else {
            incidents = incidentRepository.findAllByOrderByCreatedAtDesc();
        }
        return incidents.stream().map(IncidentSummary::from).toList();
    }

    @Override
    public IncidentDetails getIncidentById(String id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incident id is required");
        }
        return incidentRepository.findById(id)
                .map(IncidentDetails::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found with ID: " + id));
    }

    @Override
    @Transactional
    public IncidentDetails createIncident(CreateIncidentRequest request) {
        String requestedId = request.id();
        if (requestedId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incident id is required");
        }
        if (incidentRepository.existsById(requestedId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Incident already exists with ID: " + requestedId);
        }

        Incident incident = Incident.builder()
                .id(requestedId)
                .title(request.title())
                .description(request.description())
                .status(request.status() != null ? request.status() : IncidentStatus.OPEN)
                .severity(request.severity())
                .region(request.region())
                .primaryDeviceId(request.primaryDeviceId())
                .openedAt(Instant.now())
                .build();
        if (incident == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create incident");
        }

        Incident saved = incidentRepository.save(incident);
        return IncidentDetails.from(saved);
    }

    @Override
    @Transactional
    public IncidentDetails updateIncidentStatus(String id, UpdateIncidentStatusRequest request) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incident id is required");
        }
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found with ID: " + id));

        incident.setStatus(request.status());
        if (request.status() == IncidentStatus.RESOLVED) {
            if (incident.getResolvedAt() == null) {
                incident.setResolvedAt(Instant.now());
            }
        } else {
            incident.setResolvedAt(null);
        }

        return IncidentDetails.from(incident);
    }

    @Override
    public List<AlarmSummary> getAlarmsByIncidentId(String id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incident id is required");
        }
        if (!incidentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found with ID: " + id);
        }
        return alarmRepository.findByIncidentIdOrderByTimestampDesc(id)
                .stream()
                .map(AlarmSummary::from)
                .toList();
    }

    @Override
    public AlarmDetails getAlarmDetails(String id, String alarmId) {
        return alarmRepository.findByIdAndIncidentId(alarmId, id)
                .map(AlarmDetails::from)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Alarm '" + alarmId + "' not found under incident '" + id + "'"
                ));
    }
}
