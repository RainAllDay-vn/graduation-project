package com.gr2.noc.ai.workflow.step;

import com.gr2.noc.ai.dto.HypothesisDrafts;
import com.gr2.noc.ai.dto.RawInference;

/**
 * Step 4 of the investigation pipeline: parses the raw inference output into
 * {@link HypothesisDrafts} and enforces the anti-hallucination invariants —
 * top-3 ranked hypotheses, non-empty evidence, and target references that
 * exist in the consumed topology context.
 */
public interface HypothesisSynthesisStep {

    HypothesisDrafts synthesize(RawInference raw);
}
