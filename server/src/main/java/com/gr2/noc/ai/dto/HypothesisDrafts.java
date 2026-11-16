package com.gr2.noc.ai.dto;

import com.gr2.noc.hypothesis.dto.create.CreateHypothesisRequest;
import lombok.Builder;

import java.util.Collections;
import java.util.List;

/**
 * Validated and normalized root cause hypotheses produced by the synthesis step,
 * ready to be persisted through the Hypothesis module.
 */
@Builder
public record HypothesisDrafts(
    String incidentId,
    List<CreateHypothesisRequest> drafts,
    String engineType,
    List<String> consultedRunbooks
) {
    public HypothesisDrafts {
        drafts = drafts != null ? drafts : Collections.emptyList();
        consultedRunbooks = consultedRunbooks != null ? consultedRunbooks : Collections.emptyList();
    }
}
