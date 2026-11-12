package com.gr2.noc.topology.dto.get;

import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.model.NetworkDevice;
import lombok.Builder;

/**
 * Summarized node representation for rendering on the stratified telecom topology map.
 */
@Builder
public record DeviceSummary(
    String id,
    String name,
    DeviceLayer layer,
    String region,
    String site,
    String ipAddress,
    String model,
    DeviceStatus status,
    Integer accessDeviceCount,
    Integer accessErrorCount
) {
    public static DeviceSummary from(NetworkDevice device) {
        if (device == null) {
            return null;
        }
        return DeviceSummary.builder()
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
                .build();
    }
}
