package com.gr2.noc.source.service;

import com.gr2.noc.source.dto.get.SyncHistoryStreamEvent;
import com.gr2.noc.source.dto.get.SyncRunSummary;
import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.enums.SyncTriggerType;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;

class SyncHistoryStreamServiceTest {

    private static class RecordingEmitter extends SseEmitter {
        final List<Object> sentEvents = new ArrayList<>();
        final AtomicBoolean completed = new AtomicBoolean(false);
        boolean failNextSend = false;

        RecordingEmitter() {
            super(0L);
        }

        @Override
        public void send(SseEventBuilder builder) throws IOException {
            if (failNextSend) {
                throw new IOException("broken pipe");
            }
            sentEvents.add(builder.build());
        }

        @Override
        public synchronized void complete() {
            completed.set(true);
            super.complete();
        }
    }

    @Test
    void subscribeAndPublishTargetsMatchingSourceOnly() {
        List<RecordingEmitter> created = new ArrayList<>();
        SyncHistoryStreamService service = new SyncHistoryStreamService() {
            @Override
            protected SseEmitter createEmitter() {
                RecordingEmitter emitter = new RecordingEmitter();
                created.add(emitter);
                return emitter;
            }
        };

        service.subscribe("DS-1");
        service.subscribe("DS-1");
        service.subscribe("DS-2");

        assertThat(service.activeSubscriberCount("DS-1")).isEqualTo(2);
        assertThat(service.activeSubscriberCount("DS-2")).isEqualTo(1);
        assertThat(created.get(0).sentEvents).hasSize(1);

        SyncHistoryStreamEvent event = SyncHistoryStreamEvent.builder()
                .sourceId("DS-1")
                .sourceStatus(SourceStatus.ACTIVE)
                .lastSyncStatus(SyncStatus.SUCCESS)
                .lastSyncAt(Instant.now())
                .record(SyncRunSummary.builder()
                        .id("SYNC-1")
                        .triggerType(SyncTriggerType.MANUAL)
                        .status(SyncStatus.SUCCESS)
                        .recordsFetched(5)
                        .recordsFailed(0)
                        .startedAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build())
                .build();

        service.onSyncRecordEvent(new SourceSyncRecordEvent(event));

        assertThat(created.get(0).sentEvents).hasSize(2);
        assertThat(created.get(1).sentEvents).hasSize(2);
        assertThat(created.get(2).sentEvents).hasSize(1);
    }

    @Test
    void removesDeadEmittersAndClosesOnSourceDelete() {
        List<RecordingEmitter> created = new ArrayList<>();
        SyncHistoryStreamService service = new SyncHistoryStreamService() {
            @Override
            protected SseEmitter createEmitter() {
                RecordingEmitter emitter = new RecordingEmitter();
                created.add(emitter);
                return emitter;
            }
        };

        service.subscribe("DS-1");
        service.subscribe("DS-1");
        created.get(0).failNextSend = true;

        service.publish(SyncHistoryStreamEvent.builder()
                .sourceId("DS-1")
                .sourceStatus(SourceStatus.ACTIVE)
                .build());

        assertThat(service.activeSubscriberCount("DS-1")).isEqualTo(1);
        assertThat(created.get(1).sentEvents).hasSize(2);

        service.closeEmitters("DS-1");
        assertThat(service.activeSubscriberCount("DS-1")).isZero();
        assertThat(created.get(1).completed).isTrue();
    }
}
