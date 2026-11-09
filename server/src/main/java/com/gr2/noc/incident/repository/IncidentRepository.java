package com.gr2.noc.incident.repository;

import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.models.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, String> {

    List<Incident> findByStatusOrderByCreatedAtDesc(IncidentStatus status);

    List<Incident> findBySeverityOrderByCreatedAtDesc(Severity severity);

    List<Incident> findByCreatedAtBetweenOrderByCreatedAtDesc(Instant start, Instant end);

    List<Incident> findByPrimaryDeviceIdOrderByCreatedAtDesc(String primaryDeviceId);
}
