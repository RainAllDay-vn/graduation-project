package com.gr2.noc.source.dto.update;

import com.gr2.noc.source.dto.get.FieldMappingDto;
import com.gr2.noc.source.enums.SourceAuthType;
import lombok.Builder;

import java.util.List;

@Builder
public record UpdateExternalSourceRequest(
    String endpointUrl,

    Integer pollIntervalSeconds,

    String brokerAddress,

    String topic,

    String consumerGroup,

    SourceAuthType authType,

    String authToken,

    List<FieldMappingDto> fieldMappings
) {
}
