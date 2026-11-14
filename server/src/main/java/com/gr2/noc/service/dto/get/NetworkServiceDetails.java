package com.gr2.noc.service.dto.get;

import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.service.model.NetworkService;
import com.gr2.noc.topology.dto.get.DeviceSummary;
import lombok.Builder;

import java.util.ArrayList;
import java.util.List;

@Builder
public record NetworkServiceDetails(
    String id,
    String name,
    String description,
    ServiceType type,
    String region,
    ServiceStatus status,
    Integer subscriberCount,
    List<DeviceSummary> dependentDevices
) {
    public static NetworkServiceDetails from(NetworkService service) {
        if (service == null) {
            return null;
        }

        List<DeviceSummary> devices = new ArrayList<>();
        if (service.getDependentDevices() != null) {
            for (var device : service.getDependentDevices()) {
                DeviceSummary summary = DeviceSummary.from(device);
                if (summary != null) {
                    devices.add(summary);
                }
            }
        }

        return NetworkServiceDetails.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .type(service.getType())
                .region(service.getRegion())
                .status(service.getStatus())
                .subscriberCount(service.getSubscriberCount() != null ? service.getSubscriberCount() : 0)
                .dependentDevices(devices)
                .build();
    }
}
