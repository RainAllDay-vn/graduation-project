package com.gr2.noc.topology.service;

import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.dto.create.CreateLinkRequest;
import com.gr2.noc.topology.dto.get.BlastRadiusReport;
import com.gr2.noc.topology.dto.get.DeviceDetails;
import com.gr2.noc.topology.dto.get.DeviceDirectoryPage;
import com.gr2.noc.topology.dto.get.LinkSummary;
import com.gr2.noc.topology.dto.get.TopologyGraph;
import com.gr2.noc.topology.dto.update.UpdateDeviceStatusRequest;
import com.gr2.noc.topology.dto.update.UpdateLinkStatusRequest;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;

import java.util.List;

public interface TopologyService {

    TopologyGraph getTopology(List<String> focusNodeIds, DeviceLayer focusLayer, Integer kHop, Integer maxNodes,
                              DeviceLayer layer, String region);

    TopologyGraph getFullGraph();

    DeviceDirectoryPage searchDevices(String search, DeviceLayer layer, DeviceStatus status, String region,
                                      int page, int size);

    List<LinkSummary> getLinks();

    TopologyGraph getSubgraph(String focusNodeId, String incidentId, Integer kHop);

    DeviceDetails getDeviceById(String id);

    BlastRadiusReport calculateBlastRadius(String deviceId);

    DeviceDetails createDevice(CreateDeviceRequest request);

    DeviceDetails upsertDevice(CreateDeviceRequest request);

    DeviceDetails updateDeviceStatus(String id, UpdateDeviceStatusRequest request);

    void removeDevice(String id, boolean hardDelete);

    LinkSummary createLink(CreateLinkRequest request);

    LinkSummary upsertLink(CreateLinkRequest request);

    LinkSummary updateLinkStatus(String linkId, UpdateLinkStatusRequest request);

    void removeLink(String linkId, boolean hardDelete);

    void clearAll();
}
