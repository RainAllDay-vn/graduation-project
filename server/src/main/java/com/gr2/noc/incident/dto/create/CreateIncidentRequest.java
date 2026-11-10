package com.gr2.noc.incident.dto.create;

import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record CreateIncidentRequest(
    @NotBlank(message = "Incident ID must not be blank")
    String id,

    @NotBlank(message = "Title must not be blank")
    String title,

    String description,

    IncidentStatus status,

    @NotNull(message = "Severity must not be null")
    Severity severity,

    String region,

    String primaryDeviceId
) {
}
