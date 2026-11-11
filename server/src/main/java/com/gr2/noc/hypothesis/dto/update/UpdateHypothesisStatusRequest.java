package com.gr2.noc.hypothesis.dto.update;

import com.gr2.noc.hypothesis.enums.HypothesisStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * Unified request DTO for hypothesis state transitions:
 * - UNDER_CONSIDERATION -> REJECTED (with reason)
 * - UNDER_CONSIDERATION -> CONFIRMED (with optional note/reason)
 * - REJECTED/CONFIRMED -> UNDER_CONSIDERATION (reopen/undo with optional reason)
 */
@Builder
public record UpdateHypothesisStatusRequest(
    @NotNull(message = "Hypothesis status must not be null")
    HypothesisStatus status,

    String reason
) {
}
