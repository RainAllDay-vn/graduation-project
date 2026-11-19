package com.gr2.noc.topology.dto.get;

import com.gr2.noc.topology.model.NetworkDevice;
import lombok.Builder;

import java.util.Collections;
import java.util.List;

@Builder
public record DeviceDirectoryPage(
    List<DeviceSummary> content,
    int page,
    int size,
    long totalElements,
    int totalPages,
    List<String> availableRegions
) {
    public static DeviceDirectoryPage of(List<NetworkDevice> devices, List<String> availableRegions,
                                         int page, int size) {
        List<DeviceSummary> summaries = devices == null
            ? Collections.emptyList()
            : devices.stream().map(DeviceSummary::from).toList();

        long totalElements = summaries.size();
        int totalPages = size <= 0 ? 0 : (int) Math.ceil((double) totalElements / size);
        int safePage = Math.max(page, 0);

        int fromIndex = safePage * size;
        List<DeviceSummary> content = fromIndex >= summaries.size() || size <= 0
            ? Collections.emptyList()
            : summaries.subList(fromIndex, Math.min(fromIndex + size, summaries.size()));

        return DeviceDirectoryPage.builder()
            .content(content)
            .page(safePage)
            .size(size)
            .totalElements(totalElements)
            .totalPages(totalPages)
            .availableRegions(availableRegions != null ? availableRegions : Collections.emptyList())
            .build();
    }
}
