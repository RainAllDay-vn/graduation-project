package com.gr2.noc.ai.workflow;

import com.gr2.noc.ai.workflow.step.ContextGatheringStep;
import com.gr2.noc.ai.workflow.step.HypothesisSynthesisStep;
import com.gr2.noc.ai.workflow.step.InferenceStep;
import com.gr2.noc.ai.workflow.step.KnowledgeRetrievalStep;
import com.gr2.noc.hypothesis.service.HypothesisService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Investigation workflow backed by deterministic fault-code and threshold rules.
 * The default engine: requires no external API key and runs fully offline.
 */
@Component
@ConditionalOnProperty(name = "app.ai.engine", havingValue = "rule-based", matchIfMissing = true)
public class RuleBasedInvestigationWorkflow extends AbstractIncidentInvestigationWorkflow {

    public RuleBasedInvestigationWorkflow(
            ContextGatheringStep contextGatheringStep,
            KnowledgeRetrievalStep knowledgeRetrievalStep,
            InferenceStep inferenceStep,
            HypothesisSynthesisStep hypothesisSynthesisStep,
            HypothesisService hypothesisService) {
        super(contextGatheringStep, knowledgeRetrievalStep, inferenceStep,
                hypothesisSynthesisStep, hypothesisService);
    }
}
