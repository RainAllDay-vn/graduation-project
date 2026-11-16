package com.gr2.noc.ai.workflow.step;

import com.gr2.noc.ai.dto.InvestigationContext;

/**
 * Step 2 of the investigation pipeline: retrieves SOP/Runbook snippets relevant to the
 * incident evidence and returns the context enriched with them via {@code withRunbooks}.
 * Engine-specific: RAG similarity search over the vector store, or deterministic
 * fault-code/keyword matching for the rule-based engine.
 */
public interface KnowledgeRetrievalStep {

    InvestigationContext retrieve(InvestigationContext context);
}
