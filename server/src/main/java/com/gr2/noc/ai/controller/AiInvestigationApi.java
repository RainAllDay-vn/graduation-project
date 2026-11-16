package com.gr2.noc.ai.controller;

import com.gr2.noc.ai.dto.InvestigationResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * REST contract for the AI root cause investigation of a single incident.
 */
@RequestMapping("/api/incidents/{incidentId}/investigation")
public interface AiInvestigationApi {

    /**
     * Triggers the automated investigation workflow with the active engine
     * (rule-based by default, RAG when configured). Produces up to three ranked
     * root cause hypotheses and persists them via the Hypothesis module.
     */
    @PostMapping("/run")
    ResponseEntity<InvestigationResult> triggerInvestigation(@PathVariable String incidentId);

    /**
     * Returns the current investigation state for the incident, reassembled from
     * the persisted hypotheses of the most recent runs.
     */
    @GetMapping("/latest")
    ResponseEntity<InvestigationResult> getLatestInvestigation(@PathVariable String incidentId);
}
