package com.gr2.noc.incident.dto.update;

import com.gr2.noc.incident.enums.IncidentStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateIncidentStatusRequest(
    @NotNull(message = "Incident status must not be null")
    IncidentStatus status
) {
}
