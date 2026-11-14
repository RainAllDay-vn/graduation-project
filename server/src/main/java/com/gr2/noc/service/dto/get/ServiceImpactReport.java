package com.gr2.noc.service.dto.get;

import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.topology.dto.get.DeviceSummary;
import lombok.Builder;

import java.util.Collections;
import java.util.List;

/**
 * Report describing the L3 service impact of a service's dependent devices,
 * used by the Dashboard's service-impact view.
 */
@Builder
public record ServiceImpactReport(
    String serviceId,
    String serviceName,
    ServiceStatus serviceStatus,
    int totalDependentDevices,
    int activeDevices,
    int degradedDevices,
    int outageDevices,
    List<DeviceSummary> affectedDevices,
    String description
) {
    public static ServiceImpactReport of(
            String serviceId,
            String serviceName,
            ServiceStatus serviceStatus,
            int activeDevices,
            int degradedDevices,
            int outageDevices,
            List<DeviceSummary> affectedDevices,
            String description
    ) {
        int total = activeDevices + degradedDevices + outageDevices;
        return ServiceImpactReport.builder()
                .serviceId(serviceId)
                .serviceName(serviceName)
                .serviceStatus(serviceStatus)
                .totalDependentDevices(total)
                .activeDevices(activeDevices)
                .degradedDevices(degradedDevices)
                .outageDevices(outageDevices)
                .affectedDevices(affectedDevices != null ? affectedDevices : Collections.emptyList())
                .description(description)
                .build();
    }
}
