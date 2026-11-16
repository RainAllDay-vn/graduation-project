package com.gr2.noc.source.repository;

import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.model.SourceSyncRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SourceSyncRecordRepository extends JpaRepository<SourceSyncRecord, String> {

    List<SourceSyncRecord> findBySourceIdOrderByStartedAtDesc(String sourceId);

    boolean existsBySourceIdAndStatus(String sourceId, SyncStatus status);

    void deleteBySourceId(String sourceId);
}
