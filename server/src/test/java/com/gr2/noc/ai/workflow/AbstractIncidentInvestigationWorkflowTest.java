package com.gr2.noc.ai.workflow;

import com.gr2.noc.ai.dto.HypothesisDrafts;
import com.gr2.noc.ai.dto.InvestigationContext;
import com.gr2.noc.ai.dto.InvestigationResult;
import com.gr2.noc.ai.dto.RawInference;
import com.gr2.noc.ai.workflow.step.ContextGatheringStep;
import com.gr2.noc.ai.workflow.step.HypothesisSynthesisStep;
import com.gr2.noc.ai.workflow.step.InferenceStep;
import com.gr2.noc.ai.workflow.step.KnowledgeRetrievalStep;
import com.gr2.noc.hypothesis.dto.create.CreateHypothesisRequest;
import com.gr2.noc.hypothesis.dto.get.HypothesisDetails;
import com.gr2.noc.hypothesis.enums.HypothesisStatus;
import com.gr2.noc.hypothesis.service.HypothesisService;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AbstractIncidentInvestigationWorkflowTest {

    private ContextGatheringStep contextGatheringStep;
    private KnowledgeRetrievalStep knowledgeRetrievalStep;
    private InferenceStep inferenceStep;
    private HypothesisSynthesisStep hypothesisSynthesisStep;
    private HypothesisService hypothesisService;
    private RecordingWorkflow workflow;

    private static final class RecordingWorkflow extends AbstractIncidentInvestigationWorkflow {
        int successCount;
        int failureCount;

        RecordingWorkflow(ContextGatheringStep s1, KnowledgeRetrievalStep s2, InferenceStep s3,
                          HypothesisSynthesisStep s4, HypothesisService hypothesisService) {
            super(s1, s2, s3, s4, hypothesisService);
        }

        @Override
        protected void onInvestigationSuccess(InvestigationResult result) {
            successCount++;
        }

        @Override
        protected void onInvestigationFailure(String incidentId, Exception ex) {
            failureCount++;
        }
    }

    @BeforeEach
    void setUp() {
        contextGatheringStep = mock(ContextGatheringStep.class);
        knowledgeRetrievalStep = mock(KnowledgeRetrievalStep.class);
        inferenceStep = mock(InferenceStep.class);
        hypothesisSynthesisStep = mock(HypothesisSynthesisStep.class);
        hypothesisService = mock(HypothesisService.class);
        workflow = new RecordingWorkflow(
                contextGatheringStep, knowledgeRetrievalStep, inferenceStep,
                hypothesisSynthesisStep, hypothesisService);
    }

    @Test
    void shouldRunStepsInFixedOrderAndPersistDrafts() {
        InvestigationContext context = InvestigationContext.builder()
                .incident(details("INC-1"))
                .build();
        HypothesisDrafts drafts = new HypothesisDrafts(
                "INC-1",
                List.of(new CreateHypothesisRequest(1, 80, "Cause", "Cause", null, null,
                        null, null, null, null, "why", "cli", "verify",
                        List.of("evidence-1"), List.of())),
                "rule-based",
                List.of("SOP-1"));
        HypothesisDetails saved = HypothesisDetails.builder()
                .id(7L)
                .incidentId("INC-1")
                .rank(1)
                .matchScore(80)
                .title("Cause")
                .status(HypothesisStatus.UNDER_CONSIDERATION)
                .evidence(List.of("evidence-1"))
                .contradictingEvidence(List.of())
                .build();

        when(contextGatheringStep.gather("INC-1")).thenReturn(context);
        when(knowledgeRetrievalStep.retrieve(context)).thenReturn(context.withRunbooks(List.of()));
        when(inferenceStep.infer(any())).thenReturn(new RawInference(context, "[]", "rule-based", List.of("SOP-1")));
        when(hypothesisSynthesisStep.synthesize(any())).thenReturn(drafts);
        when(hypothesisService.createHypothesis(anyString(), any())).thenReturn(saved);

        InvestigationResult result = workflow.execute("INC-1");

        assertEquals("INC-1", result.incidentId());
        assertEquals("rule-based", result.engineType());
        assertEquals(List.of("SOP-1"), result.consultedRunbooks());
        assertEquals(1, result.hypotheses().size());
        assertEquals(7L, result.hypotheses().get(0).id());
        assertNotNull(result.duration());
        assertTrue(result.duration().toMillis() >= 0);
        assertEquals(1, workflow.successCount);
        assertEquals(0, workflow.failureCount);

        InOrder order = inOrder(contextGatheringStep, knowledgeRetrievalStep, inferenceStep,
                hypothesisSynthesisStep, hypothesisService);
        order.verify(contextGatheringStep).gather("INC-1");
        order.verify(knowledgeRetrievalStep).retrieve(context);
        order.verify(inferenceStep).infer(any());
        order.verify(hypothesisSynthesisStep).synthesize(any());
        order.verify(hypothesisService).createHypothesis("INC-1", drafts.drafts().get(0));
    }

    @Test
    void shouldInvokeFailureHookAndRethrowWhenStepFails() {
        when(contextGatheringStep.gather("INC-1"))
                .thenThrow(new IllegalStateException("boom"));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> workflow.execute("INC-1"));

        assertEquals("boom", ex.getMessage());
        assertEquals(0, workflow.successCount);
        assertEquals(1, workflow.failureCount);
        Mockito.verifyNoInteractions(knowledgeRetrievalStep, inferenceStep, hypothesisSynthesisStep, hypothesisService);
    }

    private static IncidentDetails details(String id) {
        return IncidentDetails.builder()
                .id(id)
                .title("Incident " + id)
                .status(IncidentStatus.INVESTIGATING)
                .severity(Severity.WARNING)
                .primaryDeviceId("DEV-1")
                .alarmCount(0)
                .build();
    }
}
