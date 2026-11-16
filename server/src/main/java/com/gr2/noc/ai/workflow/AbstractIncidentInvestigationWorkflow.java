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
import com.gr2.noc.hypothesis.service.HypothesisService;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Template Method fixing the immutable investigation algorithm. Subclasses only supply
 * engine-specific step implementations; the execution order, hypothesis persistence,
 * duration measurement, and success/failure hooks never change.
 */
@Slf4j
public abstract class AbstractIncidentInvestigationWorkflow implements IncidentInvestigationWorkflow {

    protected final ContextGatheringStep contextGatheringStep;
    protected final KnowledgeRetrievalStep knowledgeRetrievalStep;
    protected final InferenceStep inferenceStep;
    protected final HypothesisSynthesisStep hypothesisSynthesisStep;
    private final HypothesisService hypothesisService;

    protected AbstractIncidentInvestigationWorkflow(
            ContextGatheringStep contextGatheringStep,
            KnowledgeRetrievalStep knowledgeRetrievalStep,
            InferenceStep inferenceStep,
            HypothesisSynthesisStep hypothesisSynthesisStep,
            HypothesisService hypothesisService) {
        this.contextGatheringStep = contextGatheringStep;
        this.knowledgeRetrievalStep = knowledgeRetrievalStep;
        this.inferenceStep = inferenceStep;
        this.hypothesisSynthesisStep = hypothesisSynthesisStep;
        this.hypothesisService = hypothesisService;
    }

    @Override
    public final InvestigationResult execute(String incidentId) {
        Instant startedAt = Instant.now();
        try {
            InvestigationContext context = contextGatheringStep.gather(incidentId);
            context = knowledgeRetrievalStep.retrieve(context);
            RawInference raw = inferenceStep.infer(context);
            HypothesisDrafts drafts = hypothesisSynthesisStep.synthesize(raw);

            List<HypothesisDetails> saved = persistHypotheses(drafts);

            InvestigationResult result = InvestigationResult.builder()
                    .incidentId(drafts.incidentId())
                    .hypotheses(saved)
                    .consultedRunbooks(drafts.consultedRunbooks())
                    .duration(Duration.between(startedAt, Instant.now()))
                    .engineType(drafts.engineType())
                    .build();

            onInvestigationSuccess(result);
            return result;
        } catch (Exception ex) {
            onInvestigationFailure(incidentId, ex);
            throw ex;
        }
    }

    private List<HypothesisDetails> persistHypotheses(HypothesisDrafts drafts) {
        List<HypothesisDetails> saved = new ArrayList<>();
        for (CreateHypothesisRequest request : drafts.drafts()) {
            saved.add(hypothesisService.createHypothesis(drafts.incidentId(), request));
        }
        return saved;
    }

    protected void onInvestigationSuccess(InvestigationResult result) {
        log.info("AI investigation completed for incident {} by engine {} in {} ms with {} hypotheses",
                result.incidentId(), result.engineType(),
                result.duration() != null ? result.duration().toMillis() : 0,
                result.hypotheses().size());
    }

    protected void onInvestigationFailure(String incidentId, Exception ex) {
        log.warn("AI investigation failed for incident {}: {}", incidentId, ex.getMessage());
    }
}
