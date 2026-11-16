package com.gr2.noc.source.dto.create;

import com.gr2.noc.source.enums.SourceAuthType;
import com.gr2.noc.source.enums.SourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record CreateExternalSourceRequest(
    @NotBlank(message = "Name is required")
    String name,

    @NotNull(message = "Source type is required")
    SourceType type,

    String endpointUrl,

    Integer pollIntervalSeconds,

    String brokerAddress,

    String topic,

    String consumerGroup,

    SourceAuthType authType,

    String authToken
) {
}
