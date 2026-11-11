package com.gr2.noc.incident.config;

import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.IncidentRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
class IncidentDataInitializerIntegrationTest {

    @Autowired
    private IncidentRepository incidentRepository;

    @Test
    @DisplayName("Should seed 3 realistic NOC incidents when dev profile is active")
    void shouldSeedIncidentsWhenDevProfileActive() {
        assertThat(incidentRepository.count()).isGreaterThanOrEqualTo(3);

        Incident criticalIncident = incidentRepository.findById("INC-2026-0915").orElseThrow();
        assertThat(criticalIncident.getTitle()).isEqualTo("Suy hao quang học và BGP Flapping");
        assertThat(criticalIncident.getAlarms()).hasSize(3);
    }
}
