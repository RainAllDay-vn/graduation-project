package com.gr2.noc.topology.dto.create;

import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

/**
 * Request payload to register a new network device in the topology.
 */
@Builder
public record CreateDeviceRequest(
    @NotBlank(message = "Device ID must not be blank")
    String id,

    @NotBlank(message = "Device name must not be blank")
    String name,

    @NotNull(message = "Device layer must not be null")
    DeviceLayer layer,

    String region,
    String site,
    String ipAddress,
    String model,
    DeviceStatus status,
    Integer accessDeviceCount,
    Integer accessErrorCount
) {
}
