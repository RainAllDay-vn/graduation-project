package com.gr2.noc.incident.controller;

import com.gr2.noc.incident.dto.create.CreateIncidentRequest;
import com.gr2.noc.incident.dto.get.AlarmDetails;
import com.gr2.noc.incident.dto.get.AlarmSummary;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.dto.get.IncidentSummary;
import com.gr2.noc.incident.dto.update.UpdateIncidentStatusRequest;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API Contract for Network Operation Center (NOC) Incident Management.
 */
@RequestMapping("/api/incidents")
public interface IncidentApi {

    /**
     * Retrieve all incidents, optionally filtered by status and severity.
     * Used by Header Incident Switcher and incident listing page.
     */
    @GetMapping
    ResponseEntity<List<IncidentSummary>> getIncidents(
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) Severity severity
    );

    /**
     * Retrieve comprehensive details of an incident by ID.
     * Used by Inspector Header and Overview panel.
     */
    @GetMapping("/{id}")
    ResponseEntity<IncidentDetails> getIncidentById(@PathVariable String id);

    /**
     * Create a new incident.
     */
    @PostMapping
    ResponseEntity<IncidentDetails> createIncident(@Valid @RequestBody CreateIncidentRequest request);

    /**
     * Update incident lifecycle status.
     * Used by quick action buttons in Inspector Header (e.g. Mark Mitigated, Resolve).
     */
    @PatchMapping("/{id}/status")
    ResponseEntity<IncidentDetails> updateIncidentStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateIncidentStatusRequest request
    );

    /**
     * Retrieve summarized alarms associated with a specific incident.
     * Used by Inspector Tab Alarms (Section 5.2).
     */
    @GetMapping("/{id}/alarms")
    ResponseEntity<List<AlarmSummary>> getAlarmsByIncidentId(@PathVariable String id);

    /**
     * Retrieve full details of a specific alarm within an incident.
     */
    @GetMapping("/{id}/alarms/{alarmId}")
    ResponseEntity<AlarmDetails> getAlarmDetails(
            @PathVariable String id,
            @PathVariable String alarmId
    );
}
