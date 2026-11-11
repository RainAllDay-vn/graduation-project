package com.gr2.noc.hypothesis.dto.create;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.List;

@Builder
public record CreateHypothesisRequest(
    @NotNull(message = "Rank order must not be null")
    Integer rank,

    @NotNull(message = "Match score must not be null")
    Integer matchScore,

    @NotBlank(message = "Title must not be blank")
    String title,

    String shortTitle,
    String targetType,
    String targetId,
    String sourceNode,
    String targetNode,
    String sourcePort,
    String targetPort,
    String confidenceRationale,
    String cliCommand,
    String verificationCmd,
    List<String> evidence,
    List<String> contradictingEvidence
) {
}
