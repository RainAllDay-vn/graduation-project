package com.gr2.noc.ai.workflow.step;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.ai.dto.HypothesisDrafts;
import com.gr2.noc.ai.dto.InvestigationContext;
import com.gr2.noc.ai.dto.RawInference;
import com.gr2.noc.hypothesis.dto.create.CreateHypothesisRequest;
import com.gr2.noc.topology.dto.get.TopologyGraph;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Shared implementation of the hypothesis synthesis step: parses the raw engine output
 * (JSON array) into hypothesis drafts and enforces the anti-hallucination invariants —
 * non-empty evidence, sane match scores, and target references that exist in the
 * consumed topology. Invalid drafts are dropped; the survivors are re-ranked top-3.
 */
@Slf4j
@Service
public class HypothesisSynthesisStepImpl implements HypothesisSynthesisStep {

    private static final int MAX_HYPOTHESES = 3;
    private static final int MIN_MATCH_SCORE = 0;
    private static final int MAX_MATCH_SCORE = 100;
    private static final String TARGET_TYPE_NODE = "NODE";
    private static final String TARGET_TYPE_EDGE = "EDGE";

    private static final ObjectMapper JSON_MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    @Override
    public HypothesisDrafts synthesize(RawInference raw) {
        InvestigationContext context = requireContext(raw);
        List<CreateHypothesisRequest> parsed = parseDrafts(raw.rawContent());

        List<CreateHypothesisRequest> accepted = parsed.stream()
                .map(draft -> normalize(draft, context))
                .flatMap(Optional::stream)
                .sorted(Comparator.comparing(CreateHypothesisRequest::rank)
                        .thenComparing(Comparator.comparing(CreateHypothesisRequest::matchScore).reversed()))
                .limit(MAX_HYPOTHESES)
                .toList();

        if (accepted.isEmpty()) {
            throw new IllegalStateException(
                    "Inference output contained no valid hypotheses for incident " + context.incident().id());
        }

        return HypothesisDrafts.builder()
                .incidentId(context.incident().id())
                .drafts(reRank(accepted))
                .engineType(raw.engineType())
                .consultedRunbooks(raw.consultedRunbooks())
                .build();
    }

    private InvestigationContext requireContext(RawInference raw) {
        if (raw == null || raw.context() == null || raw.context().incident() == null) {
            throw new IllegalStateException("Inference output is missing the investigation context");
        }
        if (raw.rawContent() == null || raw.rawContent().isBlank()) {
            throw new IllegalStateException("Inference produced no output for incident "
                    + raw.context().incident().id());
        }
        return raw.context();
    }

    private List<CreateHypothesisRequest> parseDrafts(String rawContent) {
        try {
            return List.of(JSON_MAPPER.readValue(stripCodeFence(rawContent), CreateHypothesisRequest[].class));
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to parse inference output as hypothesis JSON array", ex);
        }
    }

    private String stripCodeFence(String rawContent) {
        String trimmed = rawContent.trim();
        if (!trimmed.startsWith("```")) {
            return trimmed;
        }
        int firstLineBreak = trimmed.indexOf('\n');
        int lastFence = trimmed.lastIndexOf("```");
        if (firstLineBreak < 0 || lastFence <= firstLineBreak) {
            return trimmed;
        }
        return trimmed.substring(firstLineBreak + 1, lastFence).trim();
    }

    private Optional<CreateHypothesisRequest> normalize(CreateHypothesisRequest draft, InvestigationContext context) {
        if (draft == null || draft.title() == null || draft.title().isBlank()) {
            log.warn("Dropping hypothesis draft without a title");
            return Optional.empty();
        }
        if (draft.evidence() == null || draft.evidence().isEmpty()) {
            log.warn("Dropping hypothesis '{}' without evidence (anti-hallucination rule)", draft.title());
            return Optional.empty();
        }
        if (!targetExists(draft, context)) {
            log.warn("Dropping hypothesis '{}': target {}/{} not present in topology",
                    draft.title(), draft.targetType(), draft.targetId());
            return Optional.empty();
        }

        int matchScore = draft.matchScore() == null ? 0 : clamp(draft.matchScore());
        int rank = draft.rank() == null ? Integer.MAX_VALUE : Math.max(1, draft.rank());

        return Optional.of(new CreateHypothesisRequest(
                rank,
                matchScore,
                draft.title(),
                draft.shortTitle() != null ? draft.shortTitle() : draft.title(),
                draft.targetType(),
                draft.targetId(),
                draft.sourceNode(),
                draft.targetNode(),
                draft.sourcePort(),
                draft.targetPort(),
                draft.confidenceRationale(),
                draft.cliCommand(),
                draft.verificationCmd(),
                draft.evidence(),
                draft.contradictingEvidence() != null ? draft.contradictingEvidence() : Collections.emptyList()
        ));
    }

    private boolean targetExists(CreateHypothesisRequest draft, InvestigationContext context) {
        boolean hasType = draft.targetType() != null && !draft.targetType().isBlank();
        boolean hasId = draft.targetId() != null && !draft.targetId().isBlank();
        if (!hasType && !hasId) {
            return true;
        }
        if (hasType != hasId) {
            return false;
        }
        if (TARGET_TYPE_NODE.equalsIgnoreCase(draft.targetType())) {
            return nodeExists(context.epicenterTopology(), draft.targetId());
        }
        if (TARGET_TYPE_EDGE.equalsIgnoreCase(draft.targetType())) {
            return linkExists(context.epicenterTopology(), draft.targetId());
        }
        return false;
    }

    private boolean nodeExists(TopologyGraph graph, String nodeId) {
        return graph != null && graph.nodes() != null
                && graph.nodes().stream().anyMatch(node -> nodeId.equals(node.id()));
    }

    private boolean linkExists(TopologyGraph graph, String linkId) {
        return graph != null && graph.links() != null
                && graph.links().stream().anyMatch(link -> linkId.equals(link.linkId()));
    }

    private List<CreateHypothesisRequest> reRank(List<CreateHypothesisRequest> accepted) {
        List<CreateHypothesisRequest> ranked = new ArrayList<>();
        for (int i = 0; i < accepted.size(); i++) {
            CreateHypothesisRequest draft = accepted.get(i);
            ranked.add(new CreateHypothesisRequest(
                    i + 1,
                    draft.matchScore(),
                    draft.title(),
                    draft.shortTitle(),
                    draft.targetType(),
                    draft.targetId(),
                    draft.sourceNode(),
                    draft.targetNode(),
                    draft.sourcePort(),
                    draft.targetPort(),
                    draft.confidenceRationale(),
                    draft.cliCommand(),
                    draft.verificationCmd(),
                    draft.evidence(),
                    draft.contradictingEvidence()
            ));
        }
        return ranked;
    }

    private int clamp(int value) {
        return Math.max(MIN_MATCH_SCORE, Math.min(MAX_MATCH_SCORE, value));
    }
}
