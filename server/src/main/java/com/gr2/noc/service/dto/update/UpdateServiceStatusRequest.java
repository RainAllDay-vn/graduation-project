package com.gr2.noc.service.dto.update;

import com.gr2.noc.service.enums.ServiceStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateServiceStatusRequest(
    @NotNull(message = "Service status must not be null")
    ServiceStatus status
) {
}
