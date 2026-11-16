package com.gr2.noc.source.dto.get;

import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.model.ExternalSource;
import lombok.Builder;

import java.time.Instant;

@Builder
public record ExternalSourceSummary(
    String id,
    String name,
    SourceType type,
    SourceStatus status,
    String endpointUrl,
    Integer pollIntervalSeconds,
    String brokerAddress,
    String topic,
    Integer streamLatencyMs,
    SyncStatus lastSyncStatus,
    Instant lastSyncAt,
    String lastSyncMessage
) {
    public static ExternalSourceSummary from(ExternalSource source) {
        if (source == null) {
            return null;
        }
        return ExternalSourceSummary.builder()
                .id(source.getId())
                .name(source.getName())
                .type(source.getType())
                .status(source.getStatus())
                .endpointUrl(source.getEndpointUrl())
                .pollIntervalSeconds(source.getPollIntervalSeconds())
                .brokerAddress(source.getBrokerAddress())
                .topic(source.getTopic())
                .streamLatencyMs(source.getStreamLatencyMs())
                .lastSyncStatus(source.getLastSyncStatus())
                .lastSyncAt(source.getLastSyncAt())
                .lastSyncMessage(source.getLastSyncMessage())
                .build();
    }
}
