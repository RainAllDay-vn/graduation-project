package com.gr2.noc.source.model;

import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.enums.SyncTriggerType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.lang.NonNull;

import java.time.Instant;

@Entity
@Table(name = "source_sync_history", indexes = {
        @Index(name = "idx_source_sync_source", columnList = "source_id"),
        @Index(name = "idx_source_sync_source_updated", columnList = "source_id, updated_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SourceSyncRecord {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "source_id", nullable = false, length = 64)
    private String sourceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", nullable = false, length = 16)
    private SyncTriggerType triggerType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private SyncStatus status;

    @Column(name = "records_fetched", nullable = false)
    @Builder.Default
    private long recordsFetched = 0;

    @Column(name = "records_failed", nullable = false)
    @Builder.Default
    private int recordsFailed = 0;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @NonNull
    public String getId() {
        return id;
    }

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (startedAt == null) {
            startedAt = now;
        }
        if (updatedAt == null) {
            updatedAt = finishedAt != null ? finishedAt : startedAt;
        }
    }

    @PreUpdate
    public void preUpdate() {
        Instant now = Instant.now();
        if (finishedAt == null) {
            finishedAt = now;
        }
        updatedAt = now;
    }
}
