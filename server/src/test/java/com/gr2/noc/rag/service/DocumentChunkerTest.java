package com.gr2.noc.rag.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DocumentChunkerTest {

    private final DocumentChunker chunker = new DocumentChunker();

    @Test
    void shouldReturnEmptyForNullOrBlankContent() {
        assertTrue(chunker.chunk(null).isEmpty());
        assertTrue(chunker.chunk("   \n\t  ").isEmpty());
    }

    @Test
    void shouldReturnSingleChunkForShortContent() {
        List<DocumentChunker.Chunk> chunks = chunker.chunk("Quy trình xử lý sự cố cáp quang.");

        assertEquals(1, chunks.size());
        assertEquals(0, chunks.get(0).index());
        assertEquals("Quy trình xử lý sự cố cáp quang.", chunks.get(0).text());
    }

    @Test
    void shouldChunkLongContentWithinSizeLimit() {
        String content = buildParagraphContent(12, 120);

        List<DocumentChunker.Chunk> chunks = chunker.chunk(content);

        assertTrue(chunks.size() >= 2);
        for (DocumentChunker.Chunk chunk : chunks) {
            assertTrue(chunk.text().length() <= 800);
            assertTrue(!chunk.text().isBlank());
        }
        for (int i = 0; i < chunks.size(); i++) {
            assertEquals(i, chunks.get(i).index());
        }
    }

    @Test
    void shouldCutAtParagraphBoundaryAndOverlapNextChunk() {
        String content = "A".repeat(700) + "\n\n" + "B".repeat(700) + "\n\n" + "C".repeat(700);

        List<DocumentChunker.Chunk> chunks = chunker.chunk(content);

        assertTrue(chunks.size() >= 2);
        assertEquals("A".repeat(700), chunks.get(0).text());
        String second = chunks.get(1).text();
        assertTrue(second.startsWith("A".repeat(80)));
        assertTrue(second.contains("B".repeat(100)));
    }

    @Test
    void shouldHardCutWhenContentHasNoSeparators() {
        String content = "X".repeat(2000);

        List<DocumentChunker.Chunk> chunks = chunker.chunk(content);

        assertEquals(3, chunks.size());
        assertEquals(800, chunks.get(0).text().length());
        assertEquals(800, chunks.get(1).text().length());
        assertEquals(600, chunks.get(2).text().length());
    }

    @Test
    void shouldBeDeterministic() {
        String content = buildParagraphContent(20, 90);

        List<DocumentChunker.Chunk> first = chunker.chunk(content);
        List<DocumentChunker.Chunk> second = chunker.chunk(content);

        assertEquals(first, second);
    }

    private String buildParagraphContent(int paragraphCount, int paragraphLength) {
        StringBuilder content = new StringBuilder();
        for (int i = 0; i < paragraphCount; i++) {
            if (i > 0) {
                content.append("\n\n");
            }
            content.append("Đoạn ").append(i).append(" ")
                    .append("nội dung kỹ thuật ".repeat(Math.max(1, paragraphLength / 20)));
        }
        return content.toString();
    }
}
