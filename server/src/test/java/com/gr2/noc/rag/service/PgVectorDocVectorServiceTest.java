package com.gr2.noc.rag.service;

import com.gr2.noc.document.enums.DocType;
import com.gr2.noc.document.model.TechnicalDocument;
import com.gr2.noc.rag.dto.TechnicalDocSnippet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class PgVectorDocVectorServiceTest {

    private VectorStore vectorStore;
    private PgVectorDocVectorService service;

    @BeforeEach
    void setUp() {
        vectorStore = mock(VectorStore.class);
        service = new PgVectorDocVectorService(providerReturning(vectorStore), new DocumentChunker());
        ReflectionTestUtils.setField(service, "indexingEnabled", true);
    }

    @SuppressWarnings("unchecked")
    private <T> ObjectProvider<T> providerReturning(T value) {
        ObjectProvider<T> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(value);
        return provider;
    }

    @Test
    void shouldIndexChunksWithMetadata() {
        TechnicalDocument document = TechnicalDocument.builder()
                .id("SOP-OPTICS-01")
                .title("Quy trình xử lý suy hao quang")
                .docType(DocType.OPERATION_RUNBOOK)
                .targetFaultCodes(Set.of("OPTICS_RX_POWER_LOW"))
                .content("Đoạn thứ nhất.\n\n" + "Nội dung kỹ thuật ".repeat(120))
                .build();

        service.indexDocument(document);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Document>> captor = ArgumentCaptor.forClass(List.class);
        verify(vectorStore).add(captor.capture());
        List<Document> indexed = captor.getValue();
        assertTrue(indexed.size() >= 2);
        Document first = indexed.get(0);
        assertEquals("SOP-OPTICS-01", first.getMetadata().get("documentId"));
        assertEquals(0, first.getMetadata().get("chunkIndex"));
        assertEquals("Quy trình xử lý suy hao quang", first.getMetadata().get("title"));
        assertEquals("OPERATION_RUNBOOK", first.getMetadata().get("docType"));
        assertEquals(Set.of("OPTICS_RX_POWER_LOW"), first.getMetadata().get("targetFaultCodes"));
        assertTrue(first.getText().startsWith("Đoạn thứ nhất."));
    }

    @Test
    void shouldDeleteExistingIndexBeforeReindexing() {
        TechnicalDocument document = TechnicalDocument.builder()
                .id("SOP-BGP-01")
                .title("BGP flap")
                .content("Nội dung ".repeat(200))
                .build();

        service.indexDocument(document);

        InOrder order = inOrder(vectorStore);
        order.verify(vectorStore).delete(any(Filter.Expression.class));
        order.verify(vectorStore).add(anyList());
    }

    @Test
    void shouldSkipIndexingWhenDisabled() {
        ReflectionTestUtils.setField(service, "indexingEnabled", false);

        service.indexDocument(readyDocument());

        verifyNoInteractions(vectorStore);
    }

    @Test
    void shouldSkipIndexingWhenVectorStoreMissing() {
        service = new PgVectorDocVectorService(providerReturning(null), new DocumentChunker());

        service.indexDocument(readyDocument());

        verifyNoInteractions(vectorStore);
    }

    @Test
    void shouldSkipIndexingWhenContentBlank() {
        TechnicalDocument document = TechnicalDocument.builder()
                .id("DOC-1")
                .title("Trống")
                .content("   ")
                .build();

        service.indexDocument(document);

        verifyNoInteractions(vectorStore);
    }

    @Test
    void shouldSwallowIndexingFailure() {
        doThrow(new RuntimeException("pgvector down")).when(vectorStore).add(anyList());

        assertDoesNotThrow(() -> service.indexDocument(readyDocument()));
    }

    @Test
    void shouldSearchAndMapSnippets() {
        Document match = Document.builder()
                .text("Dùng máy OTDR đo từ hai đầu tuyến.")
                .metadata(Map.of(
                        "documentId", "SOP-OPTICS-01",
                        "title", "Quy trình xử lý suy hao quang",
                        "docType", "OPERATION_RUNBOOK",
                        "chunkIndex", 2))
                .score(0.87)
                .build();
        Document matchWithoutDocType = Document.builder()
                .text("Kiểm tra log BGP NOTIFICATION.")
                .metadata(Map.of(
                        "documentId", "SOP-BGP-01",
                        "title", "Quy trình chẩn đoán BGP Flapping",
                        "chunkIndex", 0))
                .score(0.75)
                .build();
        when(vectorStore.similaritySearch(any(SearchRequest.class)))
                .thenReturn(List.of(match, matchWithoutDocType));

        List<TechnicalDocSnippet> snippets = service.searchRelevantSnippets("suy hao quang OTDR", 3, 0.7);

        assertEquals(2, snippets.size());
        TechnicalDocSnippet snippet = snippets.get(0);
        assertEquals("SOP-OPTICS-01", snippet.documentId());
        assertEquals("Quy trình xử lý suy hao quang", snippet.title());
        assertEquals(DocType.OPERATION_RUNBOOK, snippet.docType());
        assertEquals(2, snippet.chunkIndex());
        assertEquals("Dùng máy OTDR đo từ hai đầu tuyến.", snippet.content());
        assertEquals(0.87, snippet.similarityScore());
        assertNull(snippets.get(1).docType());

        ArgumentCaptor<SearchRequest> captor = ArgumentCaptor.forClass(SearchRequest.class);
        verify(vectorStore).similaritySearch(captor.capture());
        assertEquals("suy hao quang OTDR", captor.getValue().getQuery());
        assertEquals(3, captor.getValue().getTopK());
        assertEquals(0.7, captor.getValue().getSimilarityThreshold());
    }

    @Test
    void shouldReturnEmptySearchForBlankQueryOrInvalidTopK() {
        assertTrue(service.searchRelevantSnippets("   ", 3, 0.7).isEmpty());
        assertTrue(service.searchRelevantSnippets("suy hao", 0, 0.7).isEmpty());
        verifyNoInteractions(vectorStore);
    }

    @Test
    void shouldReturnEmptySearchOnFailure() {
        when(vectorStore.similaritySearch(any(SearchRequest.class)))
                .thenThrow(new RuntimeException("embedding api down"));

        assertTrue(service.searchRelevantSnippets("suy hao", 3, 0.7).isEmpty());
    }

    @Test
    void shouldDeleteIndexByMetadataFilter() {
        service.deleteIndex("SOP-OPTICS-01");

        verify(vectorStore).delete(any(Filter.Expression.class));
    }

    @Test
    void shouldSkipDeleteForNullOrUnknownStore() {
        service.deleteIndex(null);

        service = new PgVectorDocVectorService(providerReturning(null), new DocumentChunker());
        service.deleteIndex("SOP-OPTICS-01");

        verify(vectorStore, never()).delete(any(Filter.Expression.class));
    }

    @Test
    void shouldSwallowDeleteFailure() {
        doThrow(new RuntimeException("delete failed")).when(vectorStore).delete(any(Filter.Expression.class));

        assertDoesNotThrow(() -> service.deleteIndex("SOP-OPTICS-01"));
    }

    private TechnicalDocument readyDocument() {
        return TechnicalDocument.builder()
                .id("SOP-OPTICS-02")
                .title("Quy trình xử lý quá nhiệt SFP")
                .docType(DocType.OPERATION_RUNBOOK)
                .content("Nội dung vận hành ".repeat(150))
                .build();
    }
}
