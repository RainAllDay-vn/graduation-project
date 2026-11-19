package com.gr2.noc.ai.workflow;

import com.gr2.noc.ai.workflow.step.InferenceStep;
import com.gr2.noc.ai.workflow.step.KnowledgeRetrievalStep;
import com.gr2.noc.ai.workflow.step.RagInferenceStep;
import com.gr2.noc.ai.workflow.step.RagKnowledgeRetrievalStep;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(properties = "app.ai.engine=rag")
class RagInvestigationWorkflowContextTest {

    @Autowired
    private IncidentInvestigationWorkflow workflow;

    @Autowired
    private KnowledgeRetrievalStep knowledgeRetrievalStep;

    @Autowired
    private InferenceStep inferenceStep;

    @Test
    void shouldWireRagEngineWhenConfigured() {
        assertInstanceOf(RagInvestigationWorkflow.class, workflow);
        assertInstanceOf(RagKnowledgeRetrievalStep.class, knowledgeRetrievalStep);
        assertInstanceOf(RagInferenceStep.class, inferenceStep);
        assertNotNull(workflow);
    }
}
