package com.gr2.noc.topology.controller;

import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.dto.create.CreateLinkRequest;
import com.gr2.noc.topology.dto.get.BlastRadiusReport;
import com.gr2.noc.topology.dto.get.DeviceDetails;
import com.gr2.noc.topology.dto.get.DeviceDirectoryPage;
import com.gr2.noc.topology.dto.get.LinkSummary;
import com.gr2.noc.topology.dto.get.TopologyGraph;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.service.TopologyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
@RestController
@RequiredArgsConstructor
public class TopologyController implements TopologyApi {

    private final TopologyService topologyService;

    @Override
    public ResponseEntity<TopologyGraph> getTopology(List<String> focusNodeIds, DeviceLayer focusLayer, int kHop,
                                                     Integer maxNodes, DeviceLayer layer, String region) {
        return ResponseEntity.ok(topologyService.getTopology(focusNodeIds, focusLayer, kHop, maxNodes, layer, region));
    }

    @Override
    public ResponseEntity<TopologyGraph> getSubgraph(String focusNodeId, String incidentId, int kHop) {
        return ResponseEntity.ok(topologyService.getSubgraph(focusNodeId, incidentId, kHop));
    }

    @Override
    public ResponseEntity<DeviceDetails> getDeviceById(String id) {
        return ResponseEntity.ok(topologyService.getDeviceById(id));
    }

    @Override
    public ResponseEntity<DeviceDirectoryPage> searchDevices(String search, DeviceLayer layer, DeviceStatus status,
                                                             String region, int page, int size) {
        return ResponseEntity.ok(topologyService.searchDevices(search, layer, status, region, page, size));
    }

    @Override
    public ResponseEntity<List<LinkSummary>> getLinks() {
        return ResponseEntity.ok(topologyService.getLinks());
    }

    @Override
    public ResponseEntity<BlastRadiusReport> calculateBlastRadius(String deviceId) {
        return ResponseEntity.ok(topologyService.calculateBlastRadius(deviceId));
    }

    @Override
    public ResponseEntity<DeviceDetails> createDevice(CreateDeviceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(topologyService.createDevice(request));
    }

    @Override
    public ResponseEntity<LinkSummary> createLink(CreateLinkRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(topologyService.createLink(request));
    }
}
