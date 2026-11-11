package com.gr2.noc.hypothesis.config;

import com.gr2.noc.hypothesis.model.Hypothesis;
import com.gr2.noc.hypothesis.repository.HypothesisRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
@DirtiesContext
class HypothesisDataInitializerIntegrationTest {

    @Autowired
    private HypothesisRepository hypothesisRepository;

    @Test
    @DisplayName("Should seed 3 realistic root cause hypotheses when dev profile is active")
    void shouldSeedHypothesesWhenDevProfileActive() {
        List<Hypothesis> hypotheses = hypothesisRepository.findByIncidentIdOrderByRankAsc("INC-2026-0915");
        assertThat(hypotheses).hasSize(3);

        Hypothesis rank1 = hypotheses.get(0);
        assertThat(rank1.getRank()).isEqualTo(1);
        assertThat(rank1.getMatchScore()).isEqualTo(88);
        assertThat(rank1.getTitle()).isEqualTo("Suy hao tín hiệu cáp quang CORE-02 ↔ AGG-02");
        assertThat(rank1.getEvidence()).isNotEmpty();
        assertThat(rank1.getContradictingEvidence()).isNotEmpty();
        assertThat(rank1.getCliCommand()).isNotBlank();

        Hypothesis rank2 = hypotheses.get(1);
        assertThat(rank2.getRank()).isEqualTo(2);
        assertThat(rank2.getMatchScore()).isEqualTo(74);

        Hypothesis rank3 = hypotheses.get(2);
        assertThat(rank3.getRank()).isEqualTo(3);
        assertThat(rank3.getMatchScore()).isEqualTo(45);
    }
}
