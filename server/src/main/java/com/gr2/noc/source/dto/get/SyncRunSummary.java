package com.gr2.noc.source.dto.get;

import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.enums.SyncTriggerType;
import com.gr2.noc.source.model.SourceSyncRecord;
import lombok.Builder;

import java.time.Instant;

@Builder
public record SyncRunSummary(
    String id,
    SyncTriggerType triggerType,
    SyncStatus status,
    long recordsFetched,
    int recordsFailed,
    String message,
    Instant startedAt,
    Instant finishedAt,
    Instant updatedAt
) {
    public static SyncRunSummary from(SourceSyncRecord record) {
        if (record == null) {
            return null;
        }
        Instant effectiveUpdatedAt = record.getUpdatedAt() != null
                ? record.getUpdatedAt()
                : (record.getFinishedAt() != null ? record.getFinishedAt() : record.getStartedAt());
        return SyncRunSummary.builder()
                .id(record.getId())
                .triggerType(record.getTriggerType())
                .status(record.getStatus())
                .recordsFetched(record.getRecordsFetched())
                .recordsFailed(record.getRecordsFailed())
                .message(record.getMessage())
                .startedAt(record.getStartedAt())
                .finishedAt(record.getFinishedAt())
                .updatedAt(effectiveUpdatedAt)
                .build();
    }
}
