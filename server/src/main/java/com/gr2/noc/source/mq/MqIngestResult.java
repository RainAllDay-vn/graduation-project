package com.gr2.noc.source.mq;

import lombok.Builder;

@Builder
public record MqIngestResult(
    boolean success,
    long recordsIngested,
    int recordsFailed,
    String message
) {

    public static MqIngestResult success(long recordsIngested) {
        return MqIngestResult.builder()
                .success(true)
                .recordsIngested(recordsIngested)
                .build();
    }

    public static MqIngestResult success(long recordsIngested, int recordsFailed) {
        return MqIngestResult.builder()
                .success(true)
                .recordsIngested(recordsIngested)
                .recordsFailed(recordsFailed)
                .build();
    }

    public static MqIngestResult failed(String message) {
        return MqIngestResult.builder()
                .success(false)
                .message(message)
                .build();
    }
}
