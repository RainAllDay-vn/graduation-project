package com.gr2.noc.rag.dto;

import com.gr2.noc.document.enums.DocType;
import lombok.Builder;

/**
 * Immutable knowledge snippet retrieved from the technical document knowledge base (SOP/Runbook),
 * used as grounding evidence for AI root cause analysis.
 */
@Builder
public record TechnicalDocSnippet(
    String documentId,
    String title,
    DocType docType,
    Integer chunkIndex,
    String content,
    Double similarityScore
) {
}
