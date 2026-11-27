package com.gr2.noc.source.scheduler;

import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.enums.SyncTriggerType;
import com.gr2.noc.source.model.ExternalSource;
import com.gr2.noc.source.repository.ExternalSourceRepository;
import com.gr2.noc.source.service.SourceSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

/**
 * Periodically polls active REST external sources whose configured
 * {@code pollIntervalSeconds} has elapsed since their last sync.
 */
@Component
@ConditionalOnProperty(name = "app.sources.scheduler.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class RestPollingScheduler {

    private final ExternalSourceRepository sourceRepository;
    private final SourceSyncService sourceSyncService;

    @Scheduled(fixedDelayString = "${app.sources.scheduler.scan-interval-ms:1000}")
    public void pollDueSources() {
        pollDueSources(Instant.now());
    }

    void pollDueSources(Instant now) {
        List<ExternalSource> candidates =
                sourceRepository.findByTypeAndStatusNotOrderByCreatedAtAsc(SourceType.REST, SourceStatus.ERROR);
        for (ExternalSource source : candidates) {
            if (!isDue(source, now)) {
                continue;
            }
            try {
                sourceSyncService.syncNow(source.getId(), SyncTriggerType.SCHEDULED);
            } catch (ResponseStatusException e) {
                if (e.getStatusCode() == HttpStatus.CONFLICT) {
                    log.debug("Skipping scheduled sync for {} — sync already running", source.getId());
                } else {
                    log.warn("Scheduled sync failed for {}: {}", source.getId(), e.getReason());
                }
            } catch (Exception e) {
                log.warn("Unexpected error during scheduled sync for {}: {}", source.getId(), e.getMessage());
            }
        }
    }

    private boolean isDue(ExternalSource source, Instant now) {
        Integer intervalSeconds = source.getPollIntervalSeconds();
        if (intervalSeconds == null || intervalSeconds <= 0) {
            return false;
        }
        Instant lastSyncAt = source.getLastSyncAt();
        if (lastSyncAt == null) {
            return true;
        }
        return !lastSyncAt.plusSeconds(intervalSeconds).isAfter(now);
    }
}
