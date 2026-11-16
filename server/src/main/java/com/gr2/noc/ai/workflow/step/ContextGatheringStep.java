package com.gr2.noc.ai.workflow.step;

import com.gr2.noc.ai.dto.InvestigationContext;

/**
 * Step 1 of the investigation pipeline: validates that the incident exists and assembles
 * the multi-source evidence bundle (incident details, alarms, epicenter telemetry,
 * 1-hop topology) into an {@link InvestigationContext} with no runbooks attached yet.
 */
public interface ContextGatheringStep {

    InvestigationContext gather(String incidentId);
}
