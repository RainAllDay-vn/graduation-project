package com.gr2.noc.source.controller;

import com.gr2.noc.source.dto.create.CreateExternalSourceRequest;
import com.gr2.noc.source.dto.get.ExternalSourceDetails;
import com.gr2.noc.source.dto.get.ExternalSourceSummary;
import com.gr2.noc.source.dto.get.SyncRunSummary;
import com.gr2.noc.source.dto.get.TestConnectionResult;
import com.gr2.noc.source.dto.update.UpdateExternalSourceRequest;
import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.enums.SyncTriggerType;
import com.gr2.noc.source.service.SourceService;
import com.gr2.noc.source.service.SourceSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SourceController implements SourceApi {

    private final SourceService sourceService;
    private final SourceSyncService sourceSyncService;

    @Override
    public ResponseEntity<List<ExternalSourceSummary>> getSources(SourceType type, SourceStatus status, String q) {
        return ResponseEntity.ok(sourceService.getSources(type, status, q));
    }

    @Override
    public ResponseEntity<ExternalSourceDetails> getSourceById(String id) {
        return ResponseEntity.ok(sourceService.getSourceById(id));
    }

    @Override
    public ResponseEntity<ExternalSourceDetails> createSource(CreateExternalSourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sourceService.createSource(request));
    }

    @Override
    public ResponseEntity<ExternalSourceDetails> updateSource(String id, UpdateExternalSourceRequest request) {
        return ResponseEntity.ok(sourceService.updateSource(id, request));
    }

    @Override
    public ResponseEntity<Void> deleteSource(String id) {
        sourceService.deleteSource(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<TestConnectionResult> testConnection(String id) {
        return ResponseEntity.ok(sourceSyncService.testConnection(id));
    }

    @Override
    public ResponseEntity<SyncRunSummary> resyncFromScratch(String id) {
        return ResponseEntity.ok(sourceSyncService.syncNow(id, SyncTriggerType.MANUAL));
    }

    @Override
    public ResponseEntity<List<SyncRunSummary>> getSyncHistory(String id) {
        return ResponseEntity.ok(sourceSyncService.getSyncHistory(id));
    }
}
