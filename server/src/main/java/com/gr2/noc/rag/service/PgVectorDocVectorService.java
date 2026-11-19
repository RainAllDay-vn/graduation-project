package com.gr2.noc.rag.service;

import com.gr2.noc.document.enums.DocType;
import com.gr2.noc.document.model.TechnicalDocument;
import com.gr2.noc.rag.dto.TechnicalDocSnippet;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PgVectorDocVectorService implements TechnicalDocVectorService {

    static final String METADATA_DOCUMENT_ID = "documentId";
    static final String METADATA_CHUNK_INDEX = "chunkIndex";
    static final String METADATA_TITLE = "title";
    static final String METADATA_DOC_TYPE = "docType";
    static final String METADATA_TARGET_FAULT_CODES = "targetFaultCodes";

    private final ObjectProvider<VectorStore> vectorStoreProvider;
    private final DocumentChunker documentChunker;

    @Value("${app.rag.indexing-enabled:true}")
    private boolean indexingEnabled;

    @Override
    public void indexDocument(TechnicalDocument document) {
        if (document == null || document.getId() == null) {
            return;
        }
        if (!indexingEnabled) {
            log.debug("Vector indexing disabled, skipping document {}", document.getId());
            return;
        }
        VectorStore vectorStore = vectorStoreProvider.getIfAvailable();
        if (vectorStore == null) {
            log.warn("Vector store is not available, skipping indexing of document {}", document.getId());
            return;
        }
        String content = document.getContent();
        if (content == null || content.isBlank()) {
            log.warn("Document {} has no content to index", document.getId());
            return;
        }
        try {
            deleteIndex(document.getId());
            List<DocumentChunker.Chunk> chunks = documentChunker.chunk(content);
            if (chunks.isEmpty()) {
                return;
            }
            vectorStore.add(toVectorDocuments(document, chunks));
            log.info("Indexed {} chunks of document {} into the vector store", chunks.size(), document.getId());
        } catch (Exception e) {
            log.warn("Failed to index document {} into the vector store: {}", document.getId(), e.getMessage());
        }
    }

    @Override
    public List<TechnicalDocSnippet> searchRelevantSnippets(String query, int topK, double minSimilarityScore) {
        if (query == null || query.isBlank() || topK <= 0) {
            return List.of();
        }
        VectorStore vectorStore = vectorStoreProvider.getIfAvailable();
        if (vectorStore == null) {
            log.warn("Vector store is not available, returning empty search result");
            return List.of();
        }
        try {
            SearchRequest request = SearchRequest.builder()
                    .query(query)
                    .topK(topK)
                    .similarityThreshold(minSimilarityScore)
                    .build();
            return vectorStore.similaritySearch(request).stream()
                    .map(this::toSnippet)
                    .toList();
        } catch (Exception e) {
            log.warn("Vector search failed: {}", e.getMessage());
            return List.of();
        }
    }

    @Override
    public void deleteIndex(String documentId) {
        if (documentId == null) {
            return;
        }
        VectorStore vectorStore = vectorStoreProvider.getIfAvailable();
        if (vectorStore == null) {
            return;
        }
        try {
            FilterExpressionBuilder builder = new FilterExpressionBuilder();
            vectorStore.delete(builder.eq(METADATA_DOCUMENT_ID, documentId).build());
        } catch (Exception e) {
            log.warn("Failed to delete vector index of document {}: {}", documentId, e.getMessage());
        }
    }

    private List<Document> toVectorDocuments(TechnicalDocument document, List<DocumentChunker.Chunk> chunks) {
        List<Document> vectorDocuments = new ArrayList<>(chunks.size());
        for (DocumentChunker.Chunk chunk : chunks) {
            Map<String, Object> metadata = new HashMap<>();
            metadata.put(METADATA_DOCUMENT_ID, document.getId());
            metadata.put(METADATA_CHUNK_INDEX, chunk.index());
            metadata.put(METADATA_TITLE, document.getTitle());
            if (document.getDocType() != null) {
                metadata.put(METADATA_DOC_TYPE, document.getDocType().name());
            }
            if (document.getTargetFaultCodes() != null && !document.getTargetFaultCodes().isEmpty()) {
                metadata.put(METADATA_TARGET_FAULT_CODES, document.getTargetFaultCodes());
            }
            vectorDocuments.add(new Document(chunk.text(), metadata));
        }
        return vectorDocuments;
    }

    private TechnicalDocSnippet toSnippet(Document vectorDocument) {
        Map<String, Object> metadata = vectorDocument.getMetadata();
        return TechnicalDocSnippet.builder()
                .documentId((String) metadata.get(METADATA_DOCUMENT_ID))
                .title((String) metadata.get(METADATA_TITLE))
                .docType(parseDocType((String) metadata.get(METADATA_DOC_TYPE)))
                .chunkIndex(parseChunkIndex(metadata.get(METADATA_CHUNK_INDEX)))
                .content(vectorDocument.getText())
                .similarityScore(vectorDocument.getScore() != null ? vectorDocument.getScore() : 0.0)
                .build();
    }

    private DocType parseDocType(String value) {
        if (value == null) {
            return null;
        }
        try {
            return DocType.valueOf(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private Integer parseChunkIndex(Object value) {
        if (value instanceof Integer index) {
            return index;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return null;
    }
}
