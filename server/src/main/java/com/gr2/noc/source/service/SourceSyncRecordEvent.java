package com.gr2.noc.source.service;

import com.gr2.noc.source.dto.get.SyncHistoryStreamEvent;

/**
 * Internal Spring application event published when a {@code SourceSyncRecord}
 * changes, delivered to SSE subscribers after the enclosing transaction commits.
 */
public record SourceSyncRecordEvent(SyncHistoryStreamEvent payload) {
}
