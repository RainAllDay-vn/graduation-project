package com.gr2.noc.service.dto.get;

import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.service.model.NetworkService;
import lombok.Builder;

@Builder
public record NetworkServiceSummary(
    String id,
    String name,
    String description,
    ServiceType type,
    String region,
    ServiceStatus status,
    Integer subscriberCount,
    Integer dependentDeviceCount
) {
    public static NetworkServiceSummary from(NetworkService service) {
        if (service == null) {
            return null;
        }
        return NetworkServiceSummary.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .type(service.getType())
                .region(service.getRegion())
                .status(service.getStatus())
                .subscriberCount(service.getSubscriberCount() != null ? service.getSubscriberCount() : 0)
                .dependentDeviceCount(service.getDependentDevices() != null ? service.getDependentDevices().size() : 0)
                .build();
    }
}
