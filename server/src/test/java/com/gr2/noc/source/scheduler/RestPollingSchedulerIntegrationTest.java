package com.gr2.noc.source.scheduler;

import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.enums.SyncTriggerType;
import com.gr2.noc.source.model.ExternalSource;
import com.gr2.noc.source.model.SourceSyncRecord;
import com.gr2.noc.source.repository.ExternalSourceRepository;
import com.gr2.noc.source.repository.SourceSyncRecordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
@TestPropertySource(properties = {
        "app.sources.scheduler.enabled=true",
        "app.sources.scheduler.initial-delay-ms=600000",
        "app.sources.scheduler.scan-interval-ms=600000",
        "app.sources.sync.simulated=true"
})
@Transactional
@DirtiesContext
class RestPollingSchedulerIntegrationTest {

    @Autowired
    private RestPollingScheduler scheduler;

    @Autowired
    private ExternalSourceRepository sourceRepository;

    @Autowired
    private SourceSyncRecordRepository syncRecordRepository;

    @Test
    @DisplayName("Should sync due REST source and skip ERROR and MQ sources")
    void shouldSyncDueRestAndSkipErrorAndMq() {
        ExternalSource dueSource = sourceRepository.save(ExternalSource.builder()
                .id("DS-DUE-SCHED")
                .name("Due REST Source")
                .type(SourceType.REST)
                .status(SourceStatus.PENDING_FIRST_SYNC)
                .endpointUrl("http://localhost:8001/events")
                .pollIntervalSeconds(5)
                .build());
        ExternalSource errorSource = sourceRepository.save(ExternalSource.builder()
                .id("DS-ERR-SCHED")
                .name("Errored REST Source")
                .type(SourceType.REST)
                .status(SourceStatus.ERROR)
                .endpointUrl("http://localhost:8001/events")
                .pollIntervalSeconds(5)
                .build());
        ExternalSource mqSource = sourceRepository.save(ExternalSource.builder()
                .id("DS-MQ-SCHED")
                .name("MQ Source")
                .type(SourceType.MQ)
                .status(SourceStatus.ACTIVE)
                .brokerAddress("localhost:5672")
                .topic("test.sched")
                .build());

        scheduler.pollDueSources(Instant.now());

        ExternalSource synced = sourceRepository.findById(dueSource.getId()).orElseThrow();
        assertThat(synced.getStatus()).isEqualTo(SourceStatus.ACTIVE);
        assertThat(synced.getLastSyncStatus()).isEqualTo(SyncStatus.SUCCESS);
        List<SourceSyncRecord> runs = syncRecordRepository.findBySourceIdOrderByStartedAtDesc(dueSource.getId());
        assertThat(runs).hasSize(1);
        assertThat(runs.get(0).getTriggerType()).isEqualTo(SyncTriggerType.SCHEDULED);

        assertThat(syncRecordRepository.findBySourceIdOrderByStartedAtDesc(errorSource.getId())).isEmpty();
        assertThat(syncRecordRepository.findBySourceIdOrderByStartedAtDesc(mqSource.getId())).isEmpty();
    }
}
