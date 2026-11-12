package com.gr2.noc.topology.dto.get;

import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.model.NetworkDevice;
import lombok.Builder;

import java.util.Collections;
import java.util.List;

/**
 * Detailed representation of a network device, including its direct connections and status.
 */
@Builder
public record DeviceDetails(
    String id,
    String name,
    DeviceLayer layer,
    String region,
    String site,
    String ipAddress,
    String model,
    DeviceStatus status,
    Integer accessDeviceCount,
    Integer accessErrorCount,
    List<LinkSummary> links
) {
    public static DeviceDetails from(NetworkDevice device) {
        if (device == null) {
            return null;
        }

        List<LinkSummary> linkSummaries = Collections.emptyList();
        if (device.getLinks() != null && !device.getLinks().isEmpty()) {
            linkSummaries = device.getLinks().stream()
                    .map(link -> LinkSummary.from(device.getId(), link))
                    .toList();
        }

        return DeviceDetails.builder()
                .id(device.getId())
                .name(device.getName())
                .layer(device.getLayer())
                .region(device.getRegion())
                .site(device.getSite())
                .ipAddress(device.getIpAddress())
                .model(device.getModel())
                .status(device.getStatus())
                .accessDeviceCount(device.getAccessDeviceCount() != null ? device.getAccessDeviceCount() : 0)
                .accessErrorCount(device.getAccessErrorCount() != null ? device.getAccessErrorCount() : 0)
                .links(linkSummaries)
                .build();
    }
}
