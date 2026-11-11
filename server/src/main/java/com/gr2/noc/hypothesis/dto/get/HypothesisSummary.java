package com.gr2.noc.hypothesis.dto.get;

import com.gr2.noc.hypothesis.enums.HypothesisStatus;
import com.gr2.noc.hypothesis.model.Hypothesis;
import lombok.Builder;

@Builder
public record HypothesisSummary(
    Long id,
    Integer rank,
    Integer matchScore,
    String title,
    String shortTitle,
    String targetType,
    String targetId,
    HypothesisStatus status,
    String cliCommand
) {
    public static HypothesisSummary from(Hypothesis hypothesis) {
        if (hypothesis == null) {
            return null;
        }
        return HypothesisSummary.builder()
                .id(hypothesis.getId())
                .rank(hypothesis.getRank())
                .matchScore(hypothesis.getMatchScore())
                .title(hypothesis.getTitle())
                .shortTitle(hypothesis.getShortTitle())
                .targetType(hypothesis.getTargetType())
                .targetId(hypothesis.getTargetId())
                .status(hypothesis.getStatus())
                .cliCommand(hypothesis.getCliCommand())
                .build();
    }
}
