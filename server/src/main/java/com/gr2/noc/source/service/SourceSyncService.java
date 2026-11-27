package com.gr2.noc.source.service;

import com.gr2.noc.source.dto.get.SyncHistoryPage;
import com.gr2.noc.source.dto.get.SyncRunSummary;
import com.gr2.noc.source.dto.get.TestConnectionResult;
import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.enums.SyncTriggerType;
import com.gr2.noc.source.model.ExternalSource;
import com.gr2.noc.source.model.SourceSyncRecord;
import com.gr2.noc.source.repository.ExternalSourceRepository;
import com.gr2.noc.source.repository.SourceSyncRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SourceSyncService {

    private static final int MAX_HISTORY_PAGE_SIZE = 100;

    private final ExternalSourceRepository sourceRepository;
    private final SourceSyncRecordRepository syncRecordRepository;
    private final SourceConnector connector;

    public TestConnectionResult testConnection(String id) {
        ExternalSource source = findSource(id);
        return connector.testConnection(source);
    }

    public SyncHistoryPage getSyncHistory(String id, int page, int size) {
        ExternalSource source = findSource(id);
        int safePage = Math.max(page, 0);
        int effectiveSize = Math.min(Math.max(size, 1), MAX_HISTORY_PAGE_SIZE);
        Page<SourceSyncRecord> recordPage = syncRecordRepository.findPageBySourceIdLatestFirst(
                source.getId(),
                PageRequest.of(safePage, effectiveSize)
        );
        return SyncHistoryPage.from(recordPage);
    }

    @Transactional
    public SyncRunSummary syncNow(String id, SyncTriggerType trigger) {
        ExternalSource source = findSource(id);
        if (source.getType() == SourceType.MQ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Message queue sources stream continuously and do not support re-sync from scratch"
            );
        }
        if (syncRecordRepository.existsBySourceIdAndStatus(source.getId(), SyncStatus.RUNNING)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A sync is already running for this source"
            );
        }

        Instant startedAt = Instant.now();
        SourceSyncRecord run = SourceSyncRecord.builder()
                .id(generateRunId())
                .sourceId(source.getId())
                .triggerType(trigger != null ? trigger : SyncTriggerType.MANUAL)
                .status(SyncStatus.RUNNING)
                .startedAt(startedAt)
                .updatedAt(startedAt)
                .build();
        if (run == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create sync run");
        }
        syncRecordRepository.save(run);

        SyncFetchResult result;
        try {
            result = connector.fetch(source, source.getLastSyncAt());
        } catch (Exception e) {
            result = SyncFetchResult.failed("Lỗi không xác định khi đồng bộ: " + e.getMessage());
        }
        Instant finishedAt = Instant.now();

        if (result.success()) {
            run.setStatus(SyncStatus.SUCCESS);
            run.setRecordsFetched(result.recordsFetched());
            run.setRecordsFailed(result.recordsFailed());
            run.setFinishedAt(finishedAt);
            source.setStatus(SourceStatus.ACTIVE);
            source.setLastSyncAt(finishedAt);
            source.setLastSyncStatus(SyncStatus.SUCCESS);
            source.setLastSyncMessage(null);
            source.setRetryAttempts(0);
        } else {
            run.setStatus(SyncStatus.FAILED);
            run.setMessage(result.message());
            run.setFinishedAt(finishedAt);
            source.setStatus(SourceStatus.ERROR);
            source.setLastSyncAt(finishedAt);
            source.setLastSyncStatus(SyncStatus.FAILED);
            source.setLastSyncMessage(result.message());
            source.setRetryAttempts(source.getRetryAttempts() + 1);
        }

        run.setUpdatedAt(finishedAt);
        syncRecordRepository.save(run);
        sourceRepository.save(source);
        return SyncRunSummary.from(run);
    }

    private ExternalSource findSource(String id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source id is required");
        }
        return sourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Data source not found with ID: " + id));
    }

    private String generateRunId() {
        String candidate;
        do {
            candidate = "SYNC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (syncRecordRepository.existsById(candidate));
        return candidate;
    }
}
