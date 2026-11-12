package com.gr2.noc.topology.dto.get;

import lombok.Builder;

import java.util.Collections;
import java.util.List;

/**
 * Report detailing the estimated blast radius (impact scope) of a network failure.
 */
@Builder
public record BlastRadiusReport(
    String rootCauseDeviceId,
    List<String> affectedDeviceIds,
    List<String> affectedLinkIds,
    int estimatedAffectedSubscribers,
    String description
) {
    public static BlastRadiusReport of(
            String rootCauseDeviceId,
            List<String> affectedDeviceIds,
            List<String> affectedLinkIds,
            int estimatedAffectedSubscribers,
            String description
    ) {
        return BlastRadiusReport.builder()
                .rootCauseDeviceId(rootCauseDeviceId)
                .affectedDeviceIds(affectedDeviceIds != null ? affectedDeviceIds : Collections.emptyList())
                .affectedLinkIds(affectedLinkIds != null ? affectedLinkIds : Collections.emptyList())
                .estimatedAffectedSubscribers(estimatedAffectedSubscribers)
                .description(description)
                .build();
    }
}
