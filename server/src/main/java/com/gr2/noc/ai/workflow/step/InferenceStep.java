package com.gr2.noc.ai.workflow.step;

import com.gr2.noc.ai.dto.InvestigationContext;
import com.gr2.noc.ai.dto.RawInference;

/**
 * Step 3 of the investigation pipeline: performs root cause inference over the complete
 * evidence bundle (context including runbooks) and produces the raw engine output.
 * Engine-specific: LLM prompt construction + ChatClient call for RAG, deterministic
 * threshold rules emitting the same JSON schema for the rule-based engine.
 */
public interface InferenceStep {

    RawInference infer(InvestigationContext context);
}
