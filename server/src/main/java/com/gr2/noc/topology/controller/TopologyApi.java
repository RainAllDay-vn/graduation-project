package com.gr2.noc.topology.controller;

import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.dto.create.CreateLinkRequest;
import com.gr2.noc.topology.dto.get.BlastRadiusReport;
import com.gr2.noc.topology.dto.get.DeviceDetails;
import com.gr2.noc.topology.dto.get.DeviceDirectoryPage;
import com.gr2.noc.topology.dto.get.LinkSummary;
import com.gr2.noc.topology.dto.get.TopologyGraph;
import com.gr2.noc.topology.enums.DeviceLayer;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API Contract for Telecom Network Topology Management and Graph Navigation.
 */
@RequestMapping("/api/topology")
public interface TopologyApi {

    /**
     * Retrieve a bounded topology graph centered on forced starting points.
     * Starting points are mandatory: focusNodeIds (repeatable or comma-separated),
     * or focusLayer (all devices of that layer act as starting points).
     * The graph is produced by a multi-source BFS of kHop radius around the start points,
     * capped at maxNodes (closest nodes kept). layer and region act as traversal filters.
     * Returns 400 if no starting points are provided, 404 if a focus id or focus layer matches no device.
     */
    @GetMapping
    ResponseEntity<TopologyGraph> getTopology(
            @RequestParam(required = false) List<String> focusNodeIds,
            @RequestParam(required = false) DeviceLayer focusLayer,
            @RequestParam(defaultValue = "2") int kHop,
            @RequestParam(required = false) Integer maxNodes,
            @RequestParam(required = false) DeviceLayer layer,
            @RequestParam(required = false) String region
    );

    /**
     * Retrieve a focused subgraph:
     * - By focusNodeId and kHop radius (1-hop, 2-hop, 3-hop).
     * - Or by incidentId (automatically focuses on the incident's epicenter device).
     */
    @GetMapping("/subgraph")
    ResponseEntity<TopologyGraph> getSubgraph(
            @RequestParam(required = false) String focusNodeId,
            @RequestParam(required = false) String incidentId,
            @RequestParam(defaultValue = "1") int kHop
    );

    /**
     * Retrieve comprehensive details of a specific network device, including direct links.
     */
    @GetMapping("/devices/{id}")
    ResponseEntity<DeviceDetails> getDeviceById(@PathVariable String id);

    /**
     * Paged device directory with case-insensitive search (device id or name),
     * layer and region filters. Sorted by device id for stable pagination.
     */
    @GetMapping("/devices")
    ResponseEntity<DeviceDirectoryPage> searchDevices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) DeviceLayer layer,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    );

    /**
     * Calculate outage blast radius (downstream affected devices, links, and subscribers).
     */
    @GetMapping("/blast-radius/{deviceId}")
    ResponseEntity<BlastRadiusReport> calculateBlastRadius(@PathVariable String deviceId);

    /**
     * Register a new network device.
     */
    @PostMapping("/devices")
    ResponseEntity<DeviceDetails> createDevice(@Valid @RequestBody CreateDeviceRequest request);

    /**
     * Establish a new network connection link between two devices.
     */
    @PostMapping("/links")
    ResponseEntity<LinkSummary> createLink(@Valid @RequestBody CreateLinkRequest request);
}
