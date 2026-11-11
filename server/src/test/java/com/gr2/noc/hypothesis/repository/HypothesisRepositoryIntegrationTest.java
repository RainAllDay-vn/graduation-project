package com.gr2.noc.hypothesis.repository;

import com.gr2.noc.hypothesis.enums.HypothesisStatus;
import com.gr2.noc.hypothesis.model.Hypothesis;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class HypothesisRepositoryIntegrationTest {

    @Autowired
    private HypothesisRepository hypothesisRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    private Incident sampleIncident;

    @BeforeEach
    void setUp() {
        sampleIncident = Incident.builder()
                .id("INC-REPO-TEST")
                .title("Optical issue on SW-HN-02")
                .description("Investigating BGP flapping")
                .status(IncidentStatus.INVESTIGATING)
                .severity(Severity.CRITICAL)
                .region("Hà Nội")
                .primaryDeviceId("SW-HN-02")
                .openedAt(Instant.now())
                .build();
        sampleIncident = incidentRepository.save(sampleIncident);
    }

    @Test
    @DisplayName("Should persist hypothesis and retrieve by incidentId ordered by rank")
    void shouldPersistAndRetrieveByIncidentIdOrderedByRank() {
        Hypothesis hypo2 = Hypothesis.builder()
                .incident(sampleIncident)
                .rank(2)
                .matchScore(74)
                .title("Transceiver failure")
                .status(HypothesisStatus.UNDER_CONSIDERATION)
                .evidence(List.of("High temp"))
                .build();

        Hypothesis hypo1 = Hypothesis.builder()
                .incident(sampleIncident)
                .rank(1)
                .matchScore(88)
                .title("Optical attenuation")
                .status(HypothesisStatus.UNDER_CONSIDERATION)
                .evidence(List.of("Low RX power", "BGP flap"))
                .build();

        hypothesisRepository.saveAll(List.of(hypo2, hypo1));
        hypothesisRepository.flush();

        List<Hypothesis> results = hypothesisRepository.findByIncidentIdOrderByRankAsc("INC-REPO-TEST");
        assertThat(results).hasSize(2);
        assertThat(results.get(0).getRank()).isEqualTo(1);
        assertThat(results.get(0).getTitle()).isEqualTo("Optical attenuation");
        assertThat(results.get(0).getEvidence()).contains("Low RX power", "BGP flap");
        assertThat(results.get(1).getRank()).isEqualTo(2);
        assertThat(results.get(1).getTitle()).isEqualTo("Transceiver failure");
    }

    @Test
    @DisplayName("Should find hypotheses by incidentId and status ordered by rank")
    void shouldFindByIncidentIdAndStatusOrderedByRank() {
        Hypothesis underConsideration = Hypothesis.builder()
                .incident(sampleIncident)
                .rank(1)
                .matchScore(88)
                .title("Optical attenuation")
                .status(HypothesisStatus.UNDER_CONSIDERATION)
                .build();

        Hypothesis confirmed = Hypothesis.builder()
                .incident(sampleIncident)
                .rank(2)
                .matchScore(74)
                .title("Hardware failure")
                .status(HypothesisStatus.CONFIRMED)
                .build();

        hypothesisRepository.saveAll(List.of(underConsideration, confirmed));
        hypothesisRepository.flush();

        List<Hypothesis> results = hypothesisRepository.findByIncidentIdAndStatusOrderByRankAsc(
                "INC-REPO-TEST",
                HypothesisStatus.CONFIRMED
        );
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).isEqualTo("Hardware failure");
        assertThat(results.get(0).getStatus()).isEqualTo(HypothesisStatus.CONFIRMED);
    }

    @Test
    @DisplayName("Should find hypothesis by id and incidentId")
    void shouldFindByIdAndIncidentId() {
        Hypothesis hypo = Hypothesis.builder()
                .incident(sampleIncident)
                .rank(1)
                .matchScore(90)
                .title("Fibers cut")
                .status(HypothesisStatus.UNDER_CONSIDERATION)
                .build();
        Hypothesis saved = hypothesisRepository.save(hypo);

        Optional<Hypothesis> found = hypothesisRepository.findByIdAndIncidentId(saved.getId(), "INC-REPO-TEST");
        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Fibers cut");

        Optional<Hypothesis> notFoundWrongIncident = hypothesisRepository.findByIdAndIncidentId(saved.getId(), "OTHER-INC");
        assertThat(notFoundWrongIncident).isEmpty();
    }
}
