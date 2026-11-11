package com.gr2.noc.hypothesis.dto.get;

import com.gr2.noc.hypothesis.enums.HypothesisStatus;
import com.gr2.noc.hypothesis.model.Hypothesis;
import lombok.Builder;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Builder
public record HypothesisDetails(
    Long id,
    String incidentId,
    Integer rank,
    Integer matchScore,
    String title,
    String shortTitle,
    String targetType,
    String targetId,
    String sourceNode,
    String targetNode,
    String sourcePort,
    String targetPort,
    String confidenceRationale,
    HypothesisStatus status,
    String rejectionReason,
    String cliCommand,
    String verificationCmd,
    List<String> evidence,
    List<String> contradictingEvidence,
    Instant createdAt
) {
    public static HypothesisDetails from(Hypothesis hypothesis) {
        if (hypothesis == null) {
            return null;
        }
        return HypothesisDetails.builder()
                .id(hypothesis.getId())
                .incidentId(hypothesis.getIncident() != null ? hypothesis.getIncident().getId() : null)
                .rank(hypothesis.getRank())
                .matchScore(hypothesis.getMatchScore())
                .title(hypothesis.getTitle())
                .shortTitle(hypothesis.getShortTitle())
                .targetType(hypothesis.getTargetType())
                .targetId(hypothesis.getTargetId())
                .sourceNode(hypothesis.getSourceNode())
                .targetNode(hypothesis.getTargetNode())
                .sourcePort(hypothesis.getSourcePort())
                .targetPort(hypothesis.getTargetPort())
                .confidenceRationale(hypothesis.getConfidenceRationale())
                .status(hypothesis.getStatus())
                .rejectionReason(hypothesis.getRejectionReason())
                .cliCommand(hypothesis.getCliCommand())
                .verificationCmd(hypothesis.getVerificationCmd())
                .evidence(hypothesis.getEvidence() != null ? hypothesis.getEvidence() : Collections.emptyList())
                .contradictingEvidence(hypothesis.getContradictingEvidence() != null ? hypothesis.getContradictingEvidence() : Collections.emptyList())
                .createdAt(hypothesis.getCreatedAt())
                .build();
    }
}
