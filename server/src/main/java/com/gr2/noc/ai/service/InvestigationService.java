package com.gr2.noc.ai.service;

import com.gr2.noc.ai.dto.InvestigationResult;

/**
 * Orchestrates AI root cause investigation runs for incidents and exposes the
 * latest persisted investigation state.
 */
public interface InvestigationService {

    /**
     * Runs the active investigation engine (rule-based or RAG) for the incident and
     * persists the resulting hypotheses. Fails with 404 for unknown incidents and
     * 409 for already resolved incidents.
     */
    InvestigationResult runInvestigation(String incidentId);

    /**
     * Reassembles the latest investigation state from the hypotheses persisted for
     * the incident. Run metadata (duration, engine type, consulted runbooks) is only
     * available from the run response and is therefore null here.
     */
    InvestigationResult getLatestInvestigation(String incidentId);
}
