package com.gr2.noc.source.repository;

import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.model.SourceSyncRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SourceSyncRecordRepository extends JpaRepository<SourceSyncRecord, String> {

    List<SourceSyncRecord> findBySourceIdOrderByStartedAtDesc(String sourceId);

    @Query("""
            SELECT r FROM SourceSyncRecord r
            WHERE r.sourceId = :sourceId
            ORDER BY COALESCE(r.updatedAt, r.finishedAt, r.startedAt) DESC,
                     r.startedAt DESC,
                     r.id DESC
            """)
    Page<SourceSyncRecord> findPageBySourceIdLatestFirst(@Param("sourceId") String sourceId, Pageable pageable);

    boolean existsBySourceIdAndStatus(String sourceId, SyncStatus status);

    void deleteBySourceId(String sourceId);
}
