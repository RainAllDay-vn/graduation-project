package com.gr2.noc.ai.workflow;

import com.gr2.noc.ai.dto.InvestigationResult;

/**
 * Entry point of the AI root cause investigation. Implementations run the fixed
 * 4-step pipeline (context gathering, knowledge retrieval, inference, hypothesis
 * synthesis) and persist the resulting hypotheses via the Hypothesis module.
 */
public interface IncidentInvestigationWorkflow {

    InvestigationResult execute(String incidentId);
}
