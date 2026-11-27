package com.gr2.noc.source.controller;

import com.gr2.noc.source.dto.create.CreateExternalSourceRequest;
import com.gr2.noc.source.dto.get.ExternalSourceDetails;
import com.gr2.noc.source.dto.get.ExternalSourceSummary;
import com.gr2.noc.source.dto.get.SyncHistoryPage;
import com.gr2.noc.source.dto.get.SyncRunSummary;
import com.gr2.noc.source.dto.get.TestConnectionResult;
import com.gr2.noc.source.dto.update.UpdateExternalSourceRequest;
import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API contract for third-party data source management (REST polling and
 * message queue streaming), field mapping, and sync history.
 * Backs the Nguồn dữ liệu page.
 */
@RequestMapping("/api/sources")
public interface SourceApi {

    /**
     * Retrieve all configured data sources, optionally filtered by type,
     * status and free-text query on name/ID/topic.
     */
    @GetMapping
    ResponseEntity<List<ExternalSourceSummary>> getSources(
            @RequestParam(required = false) SourceType type,
            @RequestParam(required = false) SourceStatus status,
            @RequestParam(required = false) String q
    );

    /**
     * Retrieve the full configuration of a data source, including field
     * mappings and last sync state.
     */
    @GetMapping("/{id}")
    ResponseEntity<ExternalSourceDetails> getSourceById(@PathVariable String id);

    /**
     * Register a new data source. REST sources require an endpoint URL,
     * message queue sources require a broker address and topic.
     */
    @PostMapping
    ResponseEntity<ExternalSourceDetails> createSource(@Valid @RequestBody CreateExternalSourceRequest request);

    /**
     * Update configuration of a data source ("Lưu thay đổi"), including the
     * field mapping table. Null fields keep their current value.
     */
    @PutMapping("/{id}")
    ResponseEntity<ExternalSourceDetails> updateSource(
            @PathVariable String id,
            @RequestBody UpdateExternalSourceRequest request
    );

    /**
     * Delete a data source together with its sync history.
     */
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteSource(@PathVariable String id);

    /**
     * Probe a data source ("Kiểm tra kết nối") and report the inline result
     * without persisting anything.
     */
    @PostMapping("/{id}/test-connection")
    ResponseEntity<TestConnectionResult> testConnection(@PathVariable String id);

    /**
     * Re-sync a REST source from scratch ("Đồng bộ lại từ đầu") and persist a
     * sync history record. Not supported for message queue sources. Fails
     * with 409 if another sync for this source is still running.
     */
    @PostMapping("/{id}/resync")
    ResponseEntity<SyncRunSummary> resyncFromScratch(@PathVariable String id);

    /**
     * Paginated sync history of a data source, ordered with latest update first.
     * Always empty for message queue sources (continuous streaming has no poll history).
     */
    @GetMapping("/{id}/sync-history")
    ResponseEntity<SyncHistoryPage> getSyncHistory(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    );
}
