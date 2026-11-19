package com.gr2.noc.ai.workflow.step;

import com.gr2.noc.ai.dto.InvestigationContext;
import com.gr2.noc.rag.dto.TechnicalDocSnippet;
import com.gr2.noc.rag.service.TechnicalDocVectorService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * RAG knowledge retrieval: builds a semantic query from the incident title and the
 * active alarm fault codes, then runs cosine similarity search over the pgvector
 * technical-document index (design §2.2: top-3 snippets, similarity >= 0.70).
 */
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.ai.engine", havingValue = "rag")
public class RagKnowledgeRetrievalStep implements KnowledgeRetrievalStep {

    private final TechnicalDocVectorService technicalDocVectorService;

    @Value("${app.rag.retrieval.top-k:3}")
    private int topK;

    @Value("${app.rag.retrieval.min-similarity-score:0.70}")
    private double minSimilarityScore;

    @Override
    public InvestigationContext retrieve(InvestigationContext context) {
        if (context == null || context.incident() == null) {
            return context;
        }
        List<TechnicalDocSnippet> snippets = technicalDocVectorService
                .searchRelevantSnippets(buildQuery(context), topK, minSimilarityScore);
        return context.withRunbooks(snippets);
    }

    private String buildQuery(InvestigationContext context) {
        Set<String> parts = new LinkedHashSet<>();
        String title = context.incident().title();
        if (title != null && !title.isBlank()) {
            parts.add(title.trim());
        }
        if (context.alarms() != null) {
            context.alarms().stream()
                    .map(alarm -> alarm.faultCode())
                    .filter(code -> code != null && !code.isBlank())
                    .forEach(parts::add);
        }
        return String.join(" ", parts);
    }
}
