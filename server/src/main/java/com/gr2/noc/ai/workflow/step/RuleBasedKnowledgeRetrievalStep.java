package com.gr2.noc.ai.workflow.step;

import com.gr2.noc.ai.dto.InvestigationContext;
import com.gr2.noc.document.enums.IndexingStatus;
import com.gr2.noc.document.model.TechnicalDocument;
import com.gr2.noc.document.repository.TechnicalDocumentRepository;
import com.gr2.noc.rag.dto.TechnicalDocSnippet;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Rule-based knowledge retrieval: deterministic fault-code and keyword matching over
 * READY technical documents. A document scores high when its target fault codes match
 * the incident alarms verbatim, and lower for token matches in title or content.
 * Requires no vector store or external service.
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.ai.engine", havingValue = "rule-based", matchIfMissing = true)
public class RuleBasedKnowledgeRetrievalStep implements KnowledgeRetrievalStep {

    private static final int MAX_SNIPPETS = 3;
    private static final int MIN_MATCH_SCORE = 8;
    private static final int FAULT_CODE_HIT_SCORE = 25;
    private static final int TITLE_TOKEN_SCORE = 4;
    private static final int CONTENT_TOKEN_SCORE = 1;
    private static final int MAX_CONTENT_TOKEN_SCORE = 8;
    private static final int SIMILARITY_SCALE = 50;

    private final TechnicalDocumentRepository documentRepository;

    @Override
    public InvestigationContext retrieve(InvestigationContext context) {
        if (context == null || context.incident() == null) {
            return context;
        }
        Set<String> tokens = collectEvidenceTokens(context);
        List<TechnicalDocument> readyDocuments = documentRepository
                .findByIndexingStatusOrderByCreatedAtDesc(IndexingStatus.READY);

        List<TechnicalDocSnippet> snippets = readyDocuments.stream()
                .map(document -> scoreDocument(document, tokens))
                .filter(scored -> scored.score >= MIN_MATCH_SCORE)
                .sorted(Comparator.comparingInt((ScoredDocument scored) -> scored.score).reversed())
                .limit(MAX_SNIPPETS)
                .map(scored -> toSnippet(scored.document, scored.score))
                .toList();

        return context.withRunbooks(snippets);
    }

    private Set<String> collectEvidenceTokens(InvestigationContext context) {
        Set<String> tokens = new LinkedHashSet<>();
        if (context.alarms() != null) {
            context.alarms().stream()
                    .map(alarm -> alarm.faultCode())
                    .filter(code -> code != null && !code.isBlank())
                    .forEach(code -> addCodeTokens(tokens, code));
        }
        return tokens;
    }

    private void addCodeTokens(Set<String> tokens, String faultCode) {
        tokens.add(faultCode.toUpperCase(Locale.ROOT));
        for (String segment : faultCode.split("[^A-Za-z0-9]+")) {
            if (!segment.isBlank()) {
                tokens.add(segment.toUpperCase(Locale.ROOT));
            }
        }
    }

    private ScoredDocument scoreDocument(TechnicalDocument document, Set<String> tokens) {
        int score = 0;
        Set<String> documentCodes = document.getTargetFaultCodes() != null
                ? document.getTargetFaultCodes()
                : Collections.emptySet();
        for (String token : tokens) {
            if (isFullFaultCode(token) && containsIgnoreCase(documentCodes, token)) {
                score += FAULT_CODE_HIT_SCORE;
            }
        }
        String title = document.getTitle() != null ? document.getTitle().toUpperCase(Locale.ROOT) : "";
        String content = document.getContent() != null ? document.getContent().toUpperCase(Locale.ROOT) : "";
        int contentScore = 0;
        for (String token : tokens) {
            if (title.contains(token)) {
                score += TITLE_TOKEN_SCORE;
            }
            if (content.contains(token) && contentScore < MAX_CONTENT_TOKEN_SCORE) {
                contentScore += CONTENT_TOKEN_SCORE;
            }
        }
        return new ScoredDocument(document, score + contentScore);
    }

    private boolean isFullFaultCode(String token) {
        return token.contains("_");
    }

    private boolean containsIgnoreCase(Set<String> values, String token) {
        return values.stream().anyMatch(value -> value != null && value.toUpperCase(Locale.ROOT).equals(token));
    }

    private TechnicalDocSnippet toSnippet(TechnicalDocument document, int score) {
        return TechnicalDocSnippet.builder()
                .documentId(document.getId())
                .title(document.getTitle())
                .docType(document.getDocType())
                .chunkIndex(0)
                .content(document.getContent())
                .similarityScore(Math.min(1.0, (double) score / SIMILARITY_SCALE))
                .build();
    }

    private record ScoredDocument(TechnicalDocument document, int score) {
    }
}
