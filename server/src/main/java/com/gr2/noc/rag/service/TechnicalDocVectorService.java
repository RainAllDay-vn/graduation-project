package com.gr2.noc.rag.service;

import com.gr2.noc.document.model.TechnicalDocument;
import com.gr2.noc.rag.dto.TechnicalDocSnippet;

import java.util.List;

/**
 * Vector index contract for the technical-document knowledge base (design §5.2).
 * All operations are fail-soft: indexing/search errors are logged and never propagate,
 * so knowledge indexing can never break document management or investigations.
 */
public interface TechnicalDocVectorService {

    /**
     * Chunks and embeds a technical document into the pgvector index, replacing any previous index.
     */
    void indexDocument(TechnicalDocument document);

    /**
     * Semantic search over indexed document chunks, returning the most relevant snippets.
     */
    List<TechnicalDocSnippet> searchRelevantSnippets(String query, int topK, double minSimilarityScore);

    /**
     * Removes all indexed chunks of a document.
     */
    void deleteIndex(String documentId);
}
