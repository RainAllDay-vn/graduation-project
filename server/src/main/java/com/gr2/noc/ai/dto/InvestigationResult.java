package com.gr2.noc.ai.dto;

import com.gr2.noc.hypothesis.dto.get.HypothesisDetails;
import lombok.Builder;

import java.time.Duration;
import java.util.Collections;
import java.util.List;

/**
 * Aggregated outcome of one AI investigation run.
 */
@Builder
public record InvestigationResult(
    String incidentId,
    List<HypothesisDetails> hypotheses,
    List<String> consultedRunbooks,
    Duration duration,
    String engineType
) {
    public InvestigationResult {
        hypotheses = hypotheses != null ? hypotheses : Collections.emptyList();
        consultedRunbooks = consultedRunbooks != null ? consultedRunbooks : Collections.emptyList();
    }
}
