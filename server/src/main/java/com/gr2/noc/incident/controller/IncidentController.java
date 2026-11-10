package com.gr2.noc.incident.controller;

import com.gr2.noc.incident.dto.create.CreateIncidentRequest;
import com.gr2.noc.incident.dto.get.AlarmDetails;
import com.gr2.noc.incident.dto.get.AlarmSummary;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.dto.get.IncidentSummary;
import com.gr2.noc.incident.dto.update.UpdateIncidentStatusRequest;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class IncidentController implements IncidentApi {

    private final IncidentService incidentService;

    @Override
    public ResponseEntity<List<IncidentSummary>> getIncidents(IncidentStatus status, Severity severity) {
        return ResponseEntity.ok(incidentService.getIncidents(status, severity));
    }

    @Override
    public ResponseEntity<IncidentDetails> getIncidentById(String id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @Override
    public ResponseEntity<IncidentDetails> createIncident(CreateIncidentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidentService.createIncident(request));
    }

    @Override
    public ResponseEntity<IncidentDetails> updateIncidentStatus(String id, UpdateIncidentStatusRequest request) {
        return ResponseEntity.ok(incidentService.updateIncidentStatus(id, request));
    }

    @Override
    public ResponseEntity<List<AlarmSummary>> getAlarmsByIncidentId(String id) {
        return ResponseEntity.ok(incidentService.getAlarmsByIncidentId(id));
    }

    @Override
    public ResponseEntity<AlarmDetails> getAlarmDetails(String id, String alarmId) {
        return ResponseEntity.ok(incidentService.getAlarmDetails(id, alarmId));
    }
}
