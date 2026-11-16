package com.gr2.noc.source.config;

import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SyncStatus;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
@DirtiesContext
class SourceDataInitializerIntegrationTest {

    @Autowired
    private ExternalSourceRepository sourceRepository;

    @Autowired
    private SourceSyncRecordRepository syncRecordRepository;

    @Test
    @DisplayName("Should seed the four design data sources with mappings and sync history when dev profile is active")
    void shouldSeedSourcesWhenDevProfileActive() {
        List<ExternalSource> sources = sourceRepository.findAllByOrderByCreatedAtAsc();
        assertThat(sources).hasSizeGreaterThanOrEqualTo(4);

        ExternalSource zabbix = sourceRepository.findById("DS-ZABBIX-01").orElseThrow();
        assertThat(zabbix.getType().name()).isEqualTo("REST");
        assertThat(zabbix.getStatus()).isEqualTo(SourceStatus.ACTIVE);
        assertThat(zabbix.getPollIntervalSeconds()).isEqualTo(60);
        assertThat(zabbix.getFieldMappings()).hasSize(4);
        assertThat(zabbix.getFieldMappings().get(3).getTargetField()).isNull();

        List<SourceSyncRecord> zabbixHistory =
                syncRecordRepository.findBySourceIdOrderByStartedAtDesc(zabbix.getId());
        assertThat(zabbixHistory).hasSize(3);
        assertThat(zabbixHistory.get(0).getStatus()).isEqualTo(SyncStatus.SUCCESS);
        assertThat(zabbixHistory.get(0).getRecordsFetched()).isEqualTo(12480);

        ExternalSource netflow = sourceRepository.findById("DS-NETFLOW-01").orElseThrow();
        assertThat(netflow.getType().name()).isEqualTo("MQ");
        assertThat(netflow.getTopic()).isEqualTo("netflow.events");
        assertThat(netflow.getConsumerGroup()).isEqualTo("noc-topology-prod");
        assertThat(netflow.getStreamLatencyMs()).isLessThan(2000);
        assertThat(syncRecordRepository.findBySourceIdOrderByStartedAtDesc(netflow.getId())).isEmpty();

        ExternalSource crm = sourceRepository.findById("DS-CRM-01").orElseThrow();
        assertThat(crm.getStatus()).isEqualTo(SourceStatus.ERROR);
        assertThat(crm.getRetryAttempts()).isEqualTo(3);
        assertThat(crm.getLastSyncMessage()).contains("token");
        List<SourceSyncRecord> crmHistory =
                syncRecordRepository.findBySourceIdOrderByStartedAtDesc(crm.getId());
        assertThat(crmHistory).hasSize(3);
        assertThat(crmHistory.get(0).getStatus()).isEqualTo(SyncStatus.FAILED);
        assertThat(crmHistory.get(0).getMessage()).contains("token");
        assertThat(crmHistory.get(1).getStatus()).isEqualTo(SyncStatus.SUCCESS);

        ExternalSource syslog = sourceRepository.findById("DS-SYSLOG-01").orElseThrow();
        assertThat(syslog.getTopic()).isEqualTo("syslog.raw");
        assertThat(syslog.getStatus()).isEqualTo(SourceStatus.ACTIVE);
    }
}
