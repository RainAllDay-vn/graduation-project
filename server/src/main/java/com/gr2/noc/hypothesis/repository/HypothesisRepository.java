package com.gr2.noc.hypothesis.repository;

import com.gr2.noc.hypothesis.enums.HypothesisStatus;
import com.gr2.noc.hypothesis.model.Hypothesis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HypothesisRepository extends JpaRepository<Hypothesis, Long> {

    List<Hypothesis> findByIncidentIdOrderByRankAsc(String incidentId);

    List<Hypothesis> findByIncidentIdAndStatusOrderByRankAsc(String incidentId, HypothesisStatus status);

    Optional<Hypothesis> findByIdAndIncidentId(Long id, String incidentId);
}
