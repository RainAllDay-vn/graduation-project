package com.gr2.noc.topology.dto.get;

import com.gr2.noc.topology.enums.LinkType;
import com.gr2.noc.topology.model.NetworkLink;
import lombok.Builder;

/**
 * Summarized edge representation connecting two nodes on the topology graph.
 */
@Builder
public record LinkSummary(
    String linkId,
    String sourceDeviceId,
    String targetDeviceId,
    String sourcePort,
    String targetPort,
    LinkType linkType,
    Integer capacityGbps,
    String operStatus,
    Double rxPowerDbm,
    Double txPowerDbm,
    Double utilizationPercent,
    Boolean isBackup
) {
    public static LinkSummary from(String sourceDeviceId, NetworkLink link) {
        if (link == null) {
            return null;
        }
        return LinkSummary.builder()
                .linkId(link.getLinkId())
                .sourceDeviceId(sourceDeviceId)
                .targetDeviceId(link.getTargetDevice() != null ? link.getTargetDevice().getId() : null)
                .sourcePort(link.getSourcePort())
                .targetPort(link.getTargetPort())
                .linkType(link.getLinkType())
                .capacityGbps(link.getCapacityGbps())
                .operStatus(link.getOperStatus())
                .rxPowerDbm(link.getRxPowerDbm())
                .txPowerDbm(link.getTxPowerDbm())
                .utilizationPercent(link.getUtilizationPercent())
                .isBackup(link.getIsBackup())
                .build();
    }
}
