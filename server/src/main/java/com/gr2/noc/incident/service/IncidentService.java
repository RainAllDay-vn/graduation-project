package com.gr2.noc.incident.service;

import com.gr2.noc.incident.dto.create.CreateIncidentRequest;
import com.gr2.noc.incident.dto.get.AlarmDetails;
import com.gr2.noc.incident.dto.get.AlarmSummary;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.dto.get.IncidentSummary;
import com.gr2.noc.incident.dto.update.UpdateIncidentStatusRequest;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;

import java.util.List;

/**
 * Service contract for NOC Incident business logic.
 */
public interface IncidentService {

    List<IncidentSummary> getIncidents(IncidentStatus status, Severity severity);

    IncidentDetails getIncidentById(String id);

    IncidentDetails createIncident(CreateIncidentRequest request);

    IncidentDetails updateIncidentStatus(String id, UpdateIncidentStatusRequest request);

    List<AlarmSummary> getAlarmsByIncidentId(String id);

    AlarmDetails getAlarmDetails(String id, String alarmId);
}
