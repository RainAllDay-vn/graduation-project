package com.gr2.noc.topology.dto.update;

import com.gr2.noc.topology.enums.DeviceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * Partial status and access-summary update payload for an existing network device.
 */
@Builder
public record UpdateDeviceStatusRequest(
    @NotNull(message = "Device status must not be null")
    DeviceStatus status,

    Integer accessDeviceCount,
    Integer accessErrorCount
) {
}
