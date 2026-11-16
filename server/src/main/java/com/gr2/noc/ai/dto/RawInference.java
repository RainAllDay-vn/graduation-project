package com.gr2.noc.ai.dto;

import lombok.Builder;

import java.util.Collections;
import java.util.List;

/**
 * Raw output of the inference step, carrying the context it consumed
 * so the synthesis step can validate evidence without extra parameters.
 */
@Builder
public record RawInference(
    InvestigationContext context,
    String rawContent,
    String engineType,
    List<String> consultedRunbooks
) {
    public RawInference {
        consultedRunbooks = consultedRunbooks != null ? consultedRunbooks : Collections.emptyList();
    }
}
