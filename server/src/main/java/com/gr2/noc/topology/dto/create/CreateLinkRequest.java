package com.gr2.noc.topology.dto.create;

import com.gr2.noc.topology.enums.LinkType;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

/**
 * Request payload to establish a new network connection between two devices.
 */
@Builder
public record CreateLinkRequest(
    @NotBlank(message = "Link ID must not be blank")
    String linkId,

    @NotBlank(message = "Source device ID must not be blank")
    String sourceDeviceId,

    @NotBlank(message = "Target device ID must not be blank")
    String targetDeviceId,

    @NotBlank(message = "Source port must not be blank")
    String sourcePort,

    @NotBlank(message = "Target port must not be blank")
    String targetPort,

    LinkType linkType,
    Integer capacityGbps,
    String operStatus,
    Double rxPowerDbm,
    Double txPowerDbm,
    Double utilizationPercent,
    Boolean isBackup
) {
}
