package com.gr2.noc.source.dto.get;

import lombok.Builder;

@Builder
public record TestConnectionResult(
    boolean success,
    String message,
    Long latencyMs
) {
}
