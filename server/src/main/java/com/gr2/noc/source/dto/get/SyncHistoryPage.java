package com.gr2.noc.source.dto.get;

import com.gr2.noc.source.model.SourceSyncRecord;
import lombok.Builder;
import org.springframework.data.domain.Page;

import java.util.Collections;
import java.util.List;

/**
 * Paginated response for source sync history, ordered with latest update first.
 */
@Builder
public record SyncHistoryPage(
    List<SyncRunSummary> content,
    int page,
    int size,
    long totalElements,
    int totalPages
) {
    public static SyncHistoryPage from(Page<SourceSyncRecord> recordPage) {
        if (recordPage == null) {
            return SyncHistoryPage.builder()
                    .content(Collections.emptyList())
                    .page(0)
                    .size(0)
                    .totalElements(0)
                    .totalPages(0)
                    .build();
        }
        List<SyncRunSummary> content = recordPage.getContent().stream()
                .map(SyncRunSummary::from)
                .toList();
        return SyncHistoryPage.builder()
                .content(content)
                .page(recordPage.getNumber())
                .size(recordPage.getSize())
                .totalElements(recordPage.getTotalElements())
                .totalPages(recordPage.getTotalPages())
                .build();
    }
}
