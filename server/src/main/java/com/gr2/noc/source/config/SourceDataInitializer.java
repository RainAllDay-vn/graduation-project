package com.gr2.noc.source.config;

import com.gr2.noc.source.enums.SourceAuthType;
import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.enums.SyncTriggerType;
import com.gr2.noc.source.model.ExternalSource;
import com.gr2.noc.source.model.SourceFieldMapping;
import com.gr2.noc.source.model.SourceSyncRecord;
import com.gr2.noc.source.repository.ExternalSourceRepository;
import com.gr2.noc.source.repository.SourceSyncRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Seeds the third-party data source configurations with realistic telecom
 * integrations on startup (dev profile only), mirroring the Nguồn dữ liệu
 * page design.
 */
@Component
@Profile("dev")
@Order(6)
@RequiredArgsConstructor
@Slf4j
public class SourceDataInitializer implements CommandLineRunner {

    private final ExternalSourceRepository sourceRepository;
    private final SourceSyncRecordRepository syncRecordRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (sourceRepository.count() > 0) {
            log.info("Data source seed data already exists ({} records). Skipping initialization.", sourceRepository.count());
            return;
        }

        log.info("Seeding third-party data sources...");

        seedZabbixSource();
        seedNetflowSource();
        seedCrmSource();
        seedSyslogSource();

        log.info("Successfully seeded 4 data sources (2 REST polling, 2 message queue).");
    }

    private void seedZabbixSource() {
        ExternalSource source = ExternalSource.builder()
                .id("DS-ZABBIX-01")
                .name("Zabbix NOC")
                .type(SourceType.REST)
                .endpointUrl("https://zabbix.noc.internal/api_jsonrpc.php")
                .pollIntervalSeconds(60)
                .status(SourceStatus.ACTIVE)
                .lastSyncAt(Instant.now().minus(6, ChronoUnit.MINUTES))
                .lastSyncStatus(SyncStatus.SUCCESS)
                .fieldMappings(List.of(
                        new SourceFieldMapping("host.name", "Thiết bị · Tên"),
                        new SourceFieldMapping("host.ip", "Thiết bị · Địa chỉ IP"),
                        new SourceFieldMapping("icmp.rtt_ms", "Liên kết · Độ trễ"),
                        new SourceFieldMapping("snmp.temp_c", null)
                ))
                .createdAt(Instant.now().minus(30, ChronoUnit.DAYS))
                .build();
        if (source == null) {
            return;
        }
        sourceRepository.save(source);

        saveHistory("SYNC-ZBX-01", source.getId(), Instant.now().minus(6, ChronoUnit.MINUTES), 12480, null);
        saveHistory("SYNC-ZBX-02", source.getId(), Instant.now().minus(7, ChronoUnit.MINUTES), 12461, null);
        saveHistory("SYNC-ZBX-03", source.getId(), Instant.now().minus(8, ChronoUnit.MINUTES), 12455, null);
    }

    private void seedNetflowSource() {
        ExternalSource source = ExternalSource.builder()
                .id("DS-NETFLOW-01")
                .name("NetFlow Collector")
                .type(SourceType.MQ)
                .brokerAddress("localhost:5672")
                .topic("netflow.events")
                .consumerGroup("noc-topology-prod")
                .streamLatencyMs(1800)
                .status(SourceStatus.ACTIVE)
                .fieldMappings(List.of(
                        new SourceFieldMapping("flow.src_ip", "Liên kết · Điểm đầu"),
                        new SourceFieldMapping("flow.dst_ip", "Liên kết · Điểm cuối"),
                        new SourceFieldMapping("flow.bps", "Liên kết · Băng thông")
                ))
                .createdAt(Instant.now().minus(25, ChronoUnit.DAYS))
                .build();
        if (source == null) {
            return;
        }
        sourceRepository.save(source);
    }

    private void seedCrmSource() {
        ExternalSource source = ExternalSource.builder()
                .id("DS-CRM-01")
                .name("Inventory CRM")
                .type(SourceType.REST)
                .endpointUrl("https://crm.company.vn/api/v2")
                .pollIntervalSeconds(300)
                .status(SourceStatus.ERROR)
                .authType(SourceAuthType.BEARER_TOKEN)
                .retryAttempts(3)
                .lastSyncAt(Instant.now().minus(52, ChronoUnit.MINUTES))
                .lastSyncStatus(SyncStatus.FAILED)
                .lastSyncMessage("token xác thực hết hạn · lần thử lại 3/5")
                .fieldMappings(List.of(
                        new SourceFieldMapping("cmdb.host_id", "Thiết bị · Mã ngoài"),
                        new SourceFieldMapping("cmdb.site", "Thiết bị · Khu vực")
                ))
                .createdAt(Instant.now().minus(20, ChronoUnit.DAYS))
                .build();
        if (source == null) {
            return;
        }
        sourceRepository.save(source);

        saveFailedHistory("SYNC-CRM-01", source.getId(),
                Instant.now().minus(52, ChronoUnit.MINUTES), "token xác thực hết hạn · lần thử lại 3/5");
        saveHistory("SYNC-CRM-02", source.getId(), Instant.now().minus(57, ChronoUnit.MINUTES), 12390, null);
        saveHistory("SYNC-CRM-03", source.getId(), Instant.now().minus(62, ChronoUnit.MINUTES), 12388, null);
    }

    private void seedSyslogSource() {
        ExternalSource source = ExternalSource.builder()
                .id("DS-SYSLOG-01")
                .name("Syslog Gateway")
                .type(SourceType.MQ)
                .brokerAddress("localhost:5672")
                .topic("syslog.raw")
                .consumerGroup("noc-syslog-ingest")
                .streamLatencyMs(900)
                .status(SourceStatus.ACTIVE)
                .fieldMappings(List.of(
                        new SourceFieldMapping("syslog.host", "Thiết bị · Tên"),
                        new SourceFieldMapping("syslog.severity", "Cảnh báo · Mức độ nghiêm trọng")
                ))
                .createdAt(Instant.now().minus(15, ChronoUnit.DAYS))
                .build();
        if (source == null) {
            return;
        }
        sourceRepository.save(source);
    }

    private void saveHistory(String id, String sourceId, Instant startedAt, long recordsFetched, String message) {
        SourceSyncRecord record = SourceSyncRecord.builder()
                .id(id)
                .sourceId(sourceId)
                .triggerType(SyncTriggerType.SCHEDULED)
                .status(SyncStatus.SUCCESS)
                .recordsFetched(recordsFetched)
                .recordsFailed(0)
                .message(message)
                .startedAt(startedAt)
                .finishedAt(startedAt.plus(12, ChronoUnit.SECONDS))
                .build();
        if (record == null) {
            return;
        }
        syncRecordRepository.save(record);
    }

    private void saveFailedHistory(String id, String sourceId, Instant startedAt, String message) {
        SourceSyncRecord record = SourceSyncRecord.builder()
                .id(id)
                .sourceId(sourceId)
                .triggerType(SyncTriggerType.RETRY)
                .status(SyncStatus.FAILED)
                .recordsFetched(0)
                .recordsFailed(0)
                .message(message)
                .startedAt(startedAt)
                .finishedAt(startedAt.plus(30, ChronoUnit.SECONDS))
                .build();
        if (record == null) {
            return;
        }
        syncRecordRepository.save(record);
    }
}
