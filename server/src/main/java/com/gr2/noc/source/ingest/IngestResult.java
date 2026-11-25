package com.gr2.noc.source.ingest;

import lombok.Builder;

@Builder
public record IngestResult(
    boolean success,
    long recordsIngested,
    int recordsFailed,
    String message
) {

    public static IngestResult success(long recordsIngested) {
        return IngestResult.builder()
                .success(true)
                .recordsIngested(recordsIngested)
                .build();
    }

    public static IngestResult success(long recordsIngested, int recordsFailed) {
        return IngestResult.builder()
                .success(true)
                .recordsIngested(recordsIngested)
                .recordsFailed(recordsFailed)
                .build();
    }

    public static IngestResult failed(String message) {
        return IngestResult.builder()
                .success(false)
                .message(message)
                .build();
    }
}
