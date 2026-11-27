package com.gr2.noc.source.service;

import com.gr2.noc.source.dto.get.SyncHistoryStreamEvent;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Manages Server-Sent Events (SSE) subscriptions per data source and pushes
 * committed {@link SourceSyncRecordEvent} updates in real time.
 */
@Service
@Slf4j
public class SyncHistoryStreamService {

    static final String EVENT_CONNECTED = "connected";
    static final String EVENT_SYNC_RECORD = "sync-record";

    private final Map<String, CopyOnWriteArrayList<SseEmitter>> emittersBySource = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String sourceId) {
        SseEmitter emitter = createEmitter();
        emittersBySource.computeIfAbsent(sourceId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(sourceId, emitter));
        emitter.onTimeout(() -> {
            removeEmitter(sourceId, emitter);
            emitter.complete();
        });
        emitter.onError(ex -> removeEmitter(sourceId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name(EVENT_CONNECTED)
                    .data(Map.of("sourceId", sourceId)));
        } catch (IOException | IllegalStateException e) {
            removeEmitter(sourceId, emitter);
            emitter.completeWithError(e);
        }
        return emitter;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void onSyncRecordEvent(SourceSyncRecordEvent event) {
        if (event == null || event.payload() == null) {
            return;
        }
        publish(event.payload());
    }

    public void publish(SyncHistoryStreamEvent payload) {
        if (payload == null || payload.sourceId() == null) {
            return;
        }
        List<SseEmitter> emitters = emittersBySource.get(payload.sourceId());
        if (emitters == null || emitters.isEmpty()) {
            return;
        }
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name(EVENT_SYNC_RECORD)
                        .data(payload));
            } catch (IOException | IllegalStateException e) {
                log.debug("Removing closed SSE emitter for source {}: {}", payload.sourceId(), e.getMessage());
                removeEmitter(payload.sourceId(), emitter);
                try {
                    emitter.completeWithError(e);
                } catch (IllegalStateException ignored) {
                    // Already completed
                }
            }
        }
    }

    public void closeEmitters(String sourceId) {
        if (sourceId == null) {
            return;
        }
        List<SseEmitter> removed = emittersBySource.remove(sourceId);
        if (removed == null) {
            return;
        }
        for (SseEmitter emitter : removed) {
            try {
                emitter.complete();
            } catch (IllegalStateException ignored) {
                // Already completed
            }
        }
    }

    @Scheduled(fixedDelay = 25_000)
    public void sendHeartbeats() {
        for (Map.Entry<String, CopyOnWriteArrayList<SseEmitter>> entry : emittersBySource.entrySet()) {
            String sourceId = entry.getKey();
            for (SseEmitter emitter : entry.getValue()) {
                try {
                    emitter.send(SseEmitter.event().comment("keepalive"));
                } catch (IOException | IllegalStateException e) {
                    removeEmitter(sourceId, emitter);
                }
            }
        }
    }

    @PreDestroy
    public void shutdown() {
        for (String sourceId : List.copyOf(emittersBySource.keySet())) {
            closeEmitters(sourceId);
        }
    }

    int activeSubscriberCount(String sourceId) {
        List<SseEmitter> emitters = emittersBySource.get(sourceId);
        return emitters != null ? emitters.size() : 0;
    }

    protected SseEmitter createEmitter() {
        return new SseEmitter(0L);
    }

    private void removeEmitter(String sourceId, SseEmitter emitter) {
        emittersBySource.computeIfPresent(sourceId, (key, list) -> {
            list.remove(emitter);
            return list.isEmpty() ? null : list;
        });
    }
}
