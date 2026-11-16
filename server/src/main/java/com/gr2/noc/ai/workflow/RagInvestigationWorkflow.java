package com.gr2.noc.ai.workflow;

import com.gr2.noc.ai.workflow.step.ContextGatheringStep;
import com.gr2.noc.ai.workflow.step.HypothesisSynthesisStep;
import com.gr2.noc.ai.workflow.step.InferenceStep;
import com.gr2.noc.ai.workflow.step.KnowledgeRetrievalStep;
import com.gr2.noc.hypothesis.service.HypothesisService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Investigation workflow backed by RAG: pgvector similarity search over the technical
 * document knowledge base plus Spring AI {@code ChatClient} inference. Activated with
 * {@code app.ai.engine=rag}; requires a configured LLM API key and pgvector store.
 */
@Component
@ConditionalOnProperty(name = "app.ai.engine", havingValue = "rag")
public class RagInvestigationWorkflow extends AbstractIncidentInvestigationWorkflow {

    public RagInvestigationWorkflow(
            ContextGatheringStep contextGatheringStep,
            KnowledgeRetrievalStep knowledgeRetrievalStep,
            InferenceStep inferenceStep,
            HypothesisSynthesisStep hypothesisSynthesisStep,
            HypothesisService hypothesisService) {
        super(contextGatheringStep, knowledgeRetrievalStep, inferenceStep,
                hypothesisSynthesisStep, hypothesisService);
    }
}
