package com.gr2.noc.topology.dto.update;

import lombok.Builder;

/**
 * Partial operational state and optical/utilization metrics update payload for an existing network link.
 */
@Builder
public record UpdateLinkStatusRequest(
    String operStatus,
    Double utilizationPercent,
    Double rxPowerDbm,
    Double txPowerDbm
) {
}
