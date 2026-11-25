package com.gr2.noc.source.model;

import com.gr2.noc.source.enums.SourceAuthType;
import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.enums.SyncStatus;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.lang.NonNull;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "data_sources",
        indexes = {
                @Index(name = "idx_data_sources_status", columnList = "status")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_data_sources_name", columnNames = "name")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalSource {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 128)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private SourceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private SourceStatus status = SourceStatus.PENDING_FIRST_SYNC;

    @Column(name = "endpoint_url", length = 512)
    private String endpointUrl;

    @Column(name = "poll_interval_seconds")
    private Integer pollIntervalSeconds;

    @Column(name = "broker_address", length = 255)
    private String brokerAddress;

    @Column(length = 255)
    private String topic;

    @Column(name = "consumer_group", length = 128)
    private String consumerGroup;

    @Column(name = "stream_latency_ms")
    private Integer streamLatencyMs;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_type", nullable = false, length = 32)
    @Builder.Default
    private SourceAuthType authType = SourceAuthType.NONE;

    @Column(name = "auth_token", length = 512)
    private String authToken;

    @Column(name = "last_sync_at")
    private Instant lastSyncAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_sync_status", length = 16)
    private SyncStatus lastSyncStatus;

    @Column(name = "last_sync_message", columnDefinition = "TEXT")
    private String lastSyncMessage;

    @Column(name = "retry_attempts", nullable = false)
    @Builder.Default
    private int retryAttempts = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "source_field_mappings", joinColumns = @JoinColumn(name = "source_id"))
    @Builder.Default
    private List<SourceFieldMapping> fieldMappings = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt;

    @NonNull
    public String getId() {
        return id;
    }

    @NonNull
    public String getName() {
        return name;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
