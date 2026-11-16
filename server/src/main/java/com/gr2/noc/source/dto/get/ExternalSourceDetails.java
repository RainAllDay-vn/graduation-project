package com.gr2.noc.source.dto.get;

import com.gr2.noc.source.enums.SourceAuthType;
import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.model.ExternalSource;
import lombok.Builder;

import java.time.Instant;
import java.util.List;

@Builder
public record ExternalSourceDetails(
    String id,
    String name,
    SourceType type,
    SourceStatus status,
    String endpointUrl,
    Integer pollIntervalSeconds,
    String brokerAddress,
    String topic,
    String consumerGroup,
    Integer streamLatencyMs,
    SourceAuthType authType,
    String authTokenMasked,
    Integer retryAttempts,
    SyncStatus lastSyncStatus,
    Instant lastSyncAt,
    String lastSyncMessage,
    List<FieldMappingDto> fieldMappings,
    Instant createdAt,
    Instant updatedAt
) {
    public static ExternalSourceDetails from(ExternalSource source) {
        if (source == null) {
            return null;
        }
        return ExternalSourceDetails.builder()
                .id(source.getId())
                .name(source.getName())
                .type(source.getType())
                .status(source.getStatus())
                .endpointUrl(source.getEndpointUrl())
                .pollIntervalSeconds(source.getPollIntervalSeconds())
                .brokerAddress(source.getBrokerAddress())
                .topic(source.getTopic())
                .consumerGroup(source.getConsumerGroup())
                .streamLatencyMs(source.getStreamLatencyMs())
                .authType(source.getAuthType())
                .authTokenMasked(maskToken(source.getAuthToken()))
                .retryAttempts(source.getRetryAttempts())
                .lastSyncStatus(source.getLastSyncStatus())
                .lastSyncAt(source.getLastSyncAt())
                .lastSyncMessage(source.getLastSyncMessage())
                .fieldMappings(source.getFieldMappings() == null
                        ? List.of()
                        : source.getFieldMappings().stream().map(FieldMappingDto::from).toList())
                .createdAt(source.getCreatedAt())
                .updatedAt(source.getUpdatedAt())
                .build();
    }

    private static String maskToken(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        if (token.length() <= 4) {
            return "••••";
        }
        return "••••" + token.substring(token.length() - 4);
    }
}
