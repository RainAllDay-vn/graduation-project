package com.gr2.noc.topology.dto.get;

import com.gr2.noc.topology.model.NetworkDevice;
import lombok.Builder;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Graph payload representing nodes and edges for topology visualization (SVG / D3.js).
 */
@Builder
public record TopologyGraph(
    List<DeviceSummary> nodes,
    List<LinkSummary> links
) {
    public static TopologyGraph of(List<DeviceSummary> nodes, List<LinkSummary> links) {
        return TopologyGraph.builder()
                .nodes(nodes != null ? nodes : Collections.emptyList())
                .links(links != null ? links : Collections.emptyList())
                .build();
    }

    public static TopologyGraph from(List<NetworkDevice> devices) {
        if (devices == null || devices.isEmpty()) {
            return TopologyGraph.builder()
                    .nodes(Collections.emptyList())
                    .links(Collections.emptyList())
                    .build();
        }

        List<DeviceSummary> nodes = new ArrayList<>();
        List<LinkSummary> links = new ArrayList<>();

        for (NetworkDevice device : devices) {
            nodes.add(DeviceSummary.from(device));
            if (device.getLinks() != null) {
                for (var link : device.getLinks()) {
                    links.add(LinkSummary.from(device.getId(), link));
                }
            }
        }

        return TopologyGraph.builder()
                .nodes(nodes)
                .links(links)
                .build();
    }
}
