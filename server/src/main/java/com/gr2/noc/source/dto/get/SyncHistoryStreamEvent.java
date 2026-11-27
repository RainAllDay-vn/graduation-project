package com.gr2.noc.source.dto.get;

import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SyncStatus;
import lombok.Builder;

import java.time.Instant;

/**
 * Real-time SSE event payload pushed when a sync run is created or updated.
 */
@Builder
public record SyncHistoryStreamEvent(
    String sourceId,
    SyncRunSummary record,
    SourceStatus sourceStatus,
    Instant lastSyncAt,
    SyncStatus lastSyncStatus,
    String lastSyncMessage
) {
}
