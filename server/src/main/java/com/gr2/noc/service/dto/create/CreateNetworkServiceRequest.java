package com.gr2.noc.service.dto.create;

import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.List;

@Builder
public record CreateNetworkServiceRequest(
    @NotBlank(message = "Service ID must not be blank")
    String id,

    @NotBlank(message = "Service name must not be blank")
    String name,

    String description,

    @NotNull(message = "Service type must not be null")
    ServiceType type,

    String region,

    ServiceStatus status,

    Integer subscriberCount,

    List<String> dependentDeviceIds
) {
}
