package com.gr2.noc.source.scheduler;

import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.enums.SyncTriggerType;
import com.gr2.noc.source.model.ExternalSource;
import com.gr2.noc.source.repository.ExternalSourceRepository;
import com.gr2.noc.source.service.SourceSyncService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RestPollingSchedulerTest {

    private ExternalSourceRepository sourceRepository;
    private SourceSyncService sourceSyncService;
    private RestPollingScheduler scheduler;

    @BeforeEach
    void setUp() {
        sourceRepository = mock(ExternalSourceRepository.class);
        sourceSyncService = mock(SourceSyncService.class);
        scheduler = new RestPollingScheduler(sourceRepository, sourceSyncService);
    }

    private ExternalSource restSource(String id, SourceStatus status, Integer intervalSec, Instant lastSyncAt) {
        return ExternalSource.builder()
                .id(id)
                .name("Source " + id)
                .type(SourceType.REST)
                .status(status)
                .endpointUrl("http://localhost:8001/events")
                .pollIntervalSeconds(intervalSec)
                .lastSyncAt(lastSyncAt)
                .build();
    }

    @Test
    @DisplayName("Should poll pending sources and active sources whose interval elapsed")
    void shouldPollDueSources() {
        Instant now = Instant.parse("2026-11-27T03:00:10Z");
        ExternalSource neverSynced = restSource("DS-1", SourceStatus.PENDING_FIRST_SYNC, 5, null);
        ExternalSource dueActive = restSource("DS-2", SourceStatus.ACTIVE, 5, now.minusSeconds(5));

        when(sourceRepository.findByTypeAndStatusNotOrderByCreatedAtAsc(SourceType.REST, SourceStatus.ERROR))
                .thenReturn(List.of(neverSynced, dueActive));

        scheduler.pollDueSources(now);

        verify(sourceSyncService).syncNow("DS-1", SyncTriggerType.SCHEDULED);
        verify(sourceSyncService).syncNow("DS-2", SyncTriggerType.SCHEDULED);
    }

    @Test
    @DisplayName("Should skip not-due sources and sources without a positive poll interval")
    void shouldSkipNotDueAndInvalidInterval() {
        Instant now = Instant.parse("2026-11-27T03:00:10Z");
        ExternalSource notDue = restSource("DS-NOT-DUE", SourceStatus.ACTIVE, 5, now.minusSeconds(4));
        ExternalSource noInterval = restSource("DS-NO-INT", SourceStatus.ACTIVE, null, null);
        ExternalSource zeroInterval = restSource("DS-ZERO", SourceStatus.ACTIVE, 0, null);

        when(sourceRepository.findByTypeAndStatusNotOrderByCreatedAtAsc(SourceType.REST, SourceStatus.ERROR))
                .thenReturn(List.of(notDue, noInterval, zeroInterval));

        scheduler.pollDueSources(now);

        verify(sourceSyncService, never()).syncNow("DS-NOT-DUE", SyncTriggerType.SCHEDULED);
        verify(sourceSyncService, never()).syncNow("DS-NO-INT", SyncTriggerType.SCHEDULED);
        verify(sourceSyncService, never()).syncNow("DS-ZERO", SyncTriggerType.SCHEDULED);
    }

    @Test
    @DisplayName("Should swallow 409 conflict and continue polling subsequent sources")
    void shouldHandle409AndContinue() {
        Instant now = Instant.parse("2026-11-27T03:00:10Z");
        ExternalSource running = restSource("DS-RUNNING", SourceStatus.ACTIVE, 5, now.minusSeconds(10));
        ExternalSource next = restSource("DS-NEXT", SourceStatus.ACTIVE, 5, now.minusSeconds(10));

        when(sourceRepository.findByTypeAndStatusNotOrderByCreatedAtAsc(SourceType.REST, SourceStatus.ERROR))
                .thenReturn(List.of(running, next));
        when(sourceSyncService.syncNow("DS-RUNNING", SyncTriggerType.SCHEDULED))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Already running"));

        scheduler.pollDueSources(now);

        verify(sourceSyncService).syncNow("DS-RUNNING", SyncTriggerType.SCHEDULED);
        verify(sourceSyncService).syncNow("DS-NEXT", SyncTriggerType.SCHEDULED);
    }
}
