package com.gr2.noc.rag.service;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public final class DocumentChunker {

    private static final int CHUNK_SIZE = 800;
    private static final int CHUNK_OVERLAP = 100;
    private static final String PARAGRAPH_SEPARATOR = "\n\n";
    private static final String LINE_SEPARATOR = "\n";

    public List<Chunk> chunk(String content) {
        if (content == null || content.isBlank()) {
            return List.of();
        }
        String text = content.strip();
        List<Chunk> chunks = new ArrayList<>();
        int index = 0;
        int pos = 0;
        while (pos < text.length()) {
            int end = Math.min(pos + CHUNK_SIZE, text.length());
            if (end < text.length()) {
                end = findBoundary(text, pos, end);
            }
            String chunkText = text.substring(pos, end).strip();
            if (!chunkText.isEmpty()) {
                chunks.add(new Chunk(index++, chunkText));
            }
            if (end >= text.length()) {
                break;
            }
            pos = Math.max(end - CHUNK_OVERLAP, pos + 1);
        }
        return List.copyOf(chunks);
    }

    private int findBoundary(String text, int pos, int end) {
        int searchFloor = pos + (CHUNK_SIZE - CHUNK_OVERLAP) / 2;
        int paragraphBreak = text.lastIndexOf(PARAGRAPH_SEPARATOR, end - 1);
        if (paragraphBreak >= searchFloor) {
            return paragraphBreak;
        }
        int lineBreak = text.lastIndexOf(LINE_SEPARATOR, end - 1);
        if (lineBreak >= searchFloor) {
            return lineBreak;
        }
        return end;
    }

    public record Chunk(int index, String text) {
    }
}
