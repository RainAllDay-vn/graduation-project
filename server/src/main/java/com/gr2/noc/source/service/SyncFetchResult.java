package com.gr2.noc.source.service;

import lombok.Builder;

@Builder
public record SyncFetchResult(
    boolean success,
    long recordsFetched,
    int recordsFailed,
    String message
) {
    public static SyncFetchResult success(long recordsFetched, int recordsFailed) {
        return SyncFetchResult.builder()
                .success(true)
                .recordsFetched(recordsFetched)
                .recordsFailed(recordsFailed)
                .build();
    }

    public static SyncFetchResult failed(String message) {
        return SyncFetchResult.builder()
                .success(false)
                .message(message)
                .build();
    }
}
