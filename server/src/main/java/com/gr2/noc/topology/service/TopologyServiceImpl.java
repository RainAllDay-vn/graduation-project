package com.gr2.noc.topology.service;

import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.IncidentRepository;
import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.dto.create.CreateLinkRequest;
import com.gr2.noc.topology.dto.get.*;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.enums.LinkType;
import com.gr2.noc.topology.model.NetworkDevice;
import com.gr2.noc.topology.model.NetworkLink;
import com.gr2.noc.topology.repository.NetworkDeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TopologyServiceImpl implements TopologyService {

    private final NetworkDeviceRepository networkDeviceRepository;
    private final IncidentRepository incidentRepository;
    private final Map<String, NetworkDevice> inMemoryStore = new ConcurrentHashMap<>();

    @Autowired
    public TopologyServiceImpl(
            @Autowired(required = false) NetworkDeviceRepository networkDeviceRepository,
            IncidentRepository incidentRepository
    ) {
        this.networkDeviceRepository = networkDeviceRepository;
        this.incidentRepository = incidentRepository;
    }

    @Override
    public TopologyGraph getTopology(List<String> focusNodeIds, DeviceLayer focusLayer, int kHop, Integer maxNodes,
                                     DeviceLayer layer, String region) {
        Set<String> startIds = resolveStartIds(focusNodeIds, focusLayer);
        int effectiveK = Math.min(Math.max(kHop, 1), 3);
        int effectiveMaxNodes = (maxNodes == null || maxNodes < 1) ? DEFAULT_MAX_NODES : maxNodes;

        GraphIndex index = buildGraphIndex(getAllDevices());

        Set<String> visited = boundedBfs(startIds, effectiveK, effectiveMaxNodes, index, layer, region);

        return collectGraph(visited, index.deviceMap());
    }

    @Override
    public TopologyGraph getFullGraph() {
        return TopologyGraph.from(getAllDevices());
    }

    @Override
    public DeviceDirectoryPage searchDevices(String search, DeviceLayer layer, String region, int page, int size) {
        int effectiveSize = Math.min(Math.max(size, 1), 200);

        String normalizedSearch = search == null ? null : search.trim().toLowerCase();
        List<NetworkDevice> filtered = getAllDevices().stream()
                .filter(d -> normalizedSearch == null || normalizedSearch.isBlank()
                        || (d.getId() != null && d.getId().toLowerCase().contains(normalizedSearch))
                        || (d.getName() != null && d.getName().toLowerCase().contains(normalizedSearch)))
                .filter(d -> layer == null || d.getLayer() == layer)
                .filter(d -> region == null || region.isBlank() || matchesRegion(d, region))
                .sorted(Comparator.comparing(NetworkDevice::getId,
                        Comparator.nullsLast(Comparator.<String>naturalOrder())))
                .toList();

        return DeviceDirectoryPage.of(filtered, page, effectiveSize);
    }

    private static final int DEFAULT_MAX_NODES = 150;

    private Set<String> resolveStartIds(List<String> focusNodeIds, DeviceLayer focusLayer) {
        boolean hasFocusIds = focusNodeIds != null && focusNodeIds.stream().anyMatch(id -> id != null && !id.isBlank());
        if (hasFocusIds) {
            Set<String> startIds = new LinkedHashSet<>();
            for (String id : focusNodeIds) {
                if (id == null || id.isBlank()) {
                    continue;
                }
                NetworkDevice device = findDeviceById(id.trim())
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Focus device not found with ID: " + id.trim()
                        ));
                startIds.add(device.getId());
            }
            return startIds;
        }

        if (focusLayer != null) {
            List<NetworkDevice> layerDevices = getAllDevices().stream()
                    .filter(d -> d.getLayer() == focusLayer)
                    .toList();
            if (layerDevices.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No devices found for focus layer: " + focusLayer
                );
            }
            Set<String> startIds = new LinkedHashSet<>();
            for (NetworkDevice device : layerDevices) {
                startIds.add(device.getId());
            }
            return startIds;
        }

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Starting points are required: provide focusNodeIds or focusLayer"
        );
    }

    private Set<String> boundedBfs(Set<String> startIds, int maxHops, int maxNodes, GraphIndex index,
                                   DeviceLayer layer, String region) {
        Set<String> visited = new LinkedHashSet<>();
        Queue<String> queue = new LinkedList<>();
        Map<String, Integer> distance = new HashMap<>();

        for (String startId : startIds) {
            if (visited.size() >= maxNodes) {
                return visited;
            }
            if (visited.add(startId)) {
                distance.put(startId, 0);
                queue.add(startId);
            }
        }

        while (!queue.isEmpty() && visited.size() < maxNodes) {
            String current = queue.poll();
            int currentDist = distance.get(current);

            if (currentDist >= maxHops) {
                continue;
            }
            for (String neighbor : index.neighbors().getOrDefault(current, Collections.emptySet())) {
                if (visited.contains(neighbor)) {
                    continue;
                }
                NetworkDevice device = index.deviceMap().get(neighbor);
                if (device != null && (layer != null || region != null && !region.isBlank())
                        && !matchesTraversalFilter(device, layer, region)) {
                    continue;
                }
                if (visited.size() >= maxNodes) {
                    return visited;
                }
                visited.add(neighbor);
                distance.put(neighbor, currentDist + 1);
                queue.add(neighbor);
            }
        }
        return visited;
    }

    private boolean matchesTraversalFilter(NetworkDevice device, DeviceLayer layer, String region) {
        if (layer != null && device.getLayer() != layer) {
            return false;
        }
        return region == null || region.isBlank() || matchesRegion(device, region);
    }

    private boolean matchesRegion(NetworkDevice device, String region) {
        return device.getRegion() != null && device.getRegion().toLowerCase().contains(region.toLowerCase());
    }

    private GraphIndex buildGraphIndex(List<NetworkDevice> allDevices) {
        Map<String, Set<String>> neighbors = new HashMap<>();
        Map<String, NetworkDevice> deviceMap = new HashMap<>();

        for (NetworkDevice dev : allDevices) {
            deviceMap.put(dev.getId(), dev);
            neighbors.putIfAbsent(dev.getId(), new HashSet<>());
            if (dev.getLinks() != null) {
                for (NetworkLink link : dev.getLinks()) {
                    if (link.getTargetDevice() != null) {
                        String targetId = link.getTargetDevice().getId();
                        neighbors.get(dev.getId()).add(targetId);
                        neighbors.computeIfAbsent(targetId, k -> new HashSet<>()).add(dev.getId());
                    }
                }
            }
        }
        return new GraphIndex(deviceMap, neighbors);
    }

    private TopologyGraph collectGraph(Set<String> visitedIds, Map<String, NetworkDevice> deviceMap) {
        List<DeviceSummary> nodes = new ArrayList<>();
        List<LinkSummary> links = new ArrayList<>();

        for (String id : visitedIds) {
            NetworkDevice dev = deviceMap.get(id);
            if (dev != null) {
                nodes.add(DeviceSummary.from(dev));
                if (dev.getLinks() != null) {
                    for (NetworkLink link : dev.getLinks()) {
                        if (link.getTargetDevice() != null && visitedIds.contains(link.getTargetDevice().getId())) {
                            links.add(LinkSummary.from(dev.getId(), link));
                        }
                    }
                }
            }
        }
        return TopologyGraph.of(nodes, links);
    }

    private record GraphIndex(Map<String, NetworkDevice> deviceMap, Map<String, Set<String>> neighbors) {
    }

    @Override
    public TopologyGraph getSubgraph(String focusNodeId, String incidentId, int kHop) {
        String effectiveFocusId = focusNodeId;

        if (incidentId != null && !incidentId.isBlank()) {
            Incident incident = incidentRepository.findById(incidentId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Incident not found with ID: " + incidentId
                    ));
            effectiveFocusId = incident.getPrimaryDeviceId();
        }

        if (effectiveFocusId == null || effectiveFocusId.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Either focusNodeId or incidentId must be provided"
            );
        }

        final String targetFocusId = effectiveFocusId;
        NetworkDevice focusDevice = findDeviceById(targetFocusId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Focus device not found with ID: " + targetFocusId
                ));

        int effectiveK = Math.min(Math.max(kHop, 1), 3);
        GraphIndex index = buildGraphIndex(getAllDevices());

        Set<String> visited = boundedBfs(Set.of(focusDevice.getId()), effectiveK, Integer.MAX_VALUE, index, null, null);

        return collectGraph(visited, index.deviceMap());
    }

    @Override
    public DeviceDetails getDeviceById(String id) {
        NetworkDevice device = findDeviceById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Device not found with ID: " + id
                ));
        return DeviceDetails.from(device);
    }

    @Override
    public BlastRadiusReport calculateBlastRadius(String deviceId) {
        NetworkDevice rootDevice = findDeviceById(deviceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Device not found with ID: " + deviceId
                ));

        List<NetworkDevice> all = getAllDevices();
        Map<String, Set<String>> outgoingMap = new HashMap<>();
        Map<String, NetworkDevice> deviceMap = new HashMap<>();
        Map<String, List<String>> deviceLinksMap = new HashMap<>();

        for (NetworkDevice dev : all) {
            deviceMap.put(dev.getId(), dev);
            outgoingMap.putIfAbsent(dev.getId(), new HashSet<>());
            deviceLinksMap.putIfAbsent(dev.getId(), new ArrayList<>());
            if (dev.getLinks() != null) {
                for (NetworkLink link : dev.getLinks()) {
                    if (link.getTargetDevice() != null) {
                        outgoingMap.get(dev.getId()).add(link.getTargetDevice().getId());
                        if (link.getLinkId() != null) {
                            deviceLinksMap.get(dev.getId()).add(link.getLinkId());
                        }
                    }
                }
            }
        }

        // BFS downstream to trace affected components
        Set<String> affectedNodes = new LinkedHashSet<>();
        Set<String> affectedLinks = new LinkedHashSet<>();
        Queue<String> queue = new LinkedList<>();

        queue.add(deviceId);
        affectedNodes.add(deviceId);

        while (!queue.isEmpty()) {
            String curr = queue.poll();
            if (deviceLinksMap.containsKey(curr)) {
                affectedLinks.addAll(deviceLinksMap.get(curr));
            }
            for (String next : outgoingMap.getOrDefault(curr, Collections.emptySet())) {
                if (!affectedNodes.contains(next)) {
                    affectedNodes.add(next);
                    queue.add(next);
                }
            }
        }

        int totalSubscribers = 0;
        for (String node : affectedNodes) {
            NetworkDevice dev = deviceMap.get(node);
            if (dev != null && dev.getAccessDeviceCount() != null) {
                totalSubscribers += dev.getAccessDeviceCount() * 128; // Estimated ~128 subscribers per access switch
            }
        }

        String description = String.format(
                "Sự cố tại '%s' ảnh hưởng đến %d thiết bị hạ lưu và ước tính khoảng %d thuê bao.",
                rootDevice.getName() != null ? rootDevice.getName() : deviceId,
                affectedNodes.size(),
                totalSubscribers
        );

        return BlastRadiusReport.of(
                deviceId,
                new ArrayList<>(affectedNodes),
                new ArrayList<>(affectedLinks),
                totalSubscribers,
                description
        );
    }

    @Override
    public DeviceDetails createDevice(CreateDeviceRequest request) {
        if (existsDeviceById(request.id())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Device already exists with ID: " + request.id()
            );
        }

        NetworkDevice device = NetworkDevice.builder()
                .id(request.id())
                .name(request.name())
                .layer(request.layer())
                .region(request.region())
                .site(request.site())
                .ipAddress(request.ipAddress())
                .model(request.model())
                .status(request.status() != null ? request.status() : DeviceStatus.ACTIVE)
                .accessDeviceCount(request.accessDeviceCount() != null ? request.accessDeviceCount() : 0)
                .accessErrorCount(request.accessErrorCount() != null ? request.accessErrorCount() : 0)
                .build();

        NetworkDevice saved = saveDevice(device);
        return DeviceDetails.from(saved);
    }

    @Override
    public LinkSummary createLink(CreateLinkRequest request) {
        NetworkDevice source = findDeviceById(request.sourceDeviceId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Source device not found with ID: " + request.sourceDeviceId()
                ));

        NetworkDevice target = findDeviceById(request.targetDeviceId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Target device not found with ID: " + request.targetDeviceId()
                ));

        NetworkLink link = NetworkLink.builder()
                .linkId(request.linkId())
                .sourcePort(request.sourcePort())
                .targetPort(request.targetPort())
                .linkType(request.linkType() != null ? request.linkType() : LinkType.PHYSICAL_FIBER)
                .capacityGbps(request.capacityGbps() != null ? request.capacityGbps() : 100)
                .operStatus(request.operStatus() != null ? request.operStatus() : "UP")
                .rxPowerDbm(request.rxPowerDbm())
                .txPowerDbm(request.txPowerDbm())
                .utilizationPercent(request.utilizationPercent() != null ? request.utilizationPercent() : 0.0)
                .isBackup(request.isBackup() != null ? request.isBackup() : false)
                .targetDevice(target)
                .build();

        source.addLink(link);
        saveDevice(source);

        return LinkSummary.from(source.getId(), link);
    }

    @Override
    public void clearAll() {
        inMemoryStore.clear();
        if (networkDeviceRepository != null) {
            try {
                networkDeviceRepository.deleteAll();
            } catch (Exception ignored) {
            }
        }
    }

    private List<NetworkDevice> getAllDevices() {
        if (networkDeviceRepository != null) {
            try {
                List<NetworkDevice> fromDb = networkDeviceRepository.findAllWithLinks();
                if (fromDb != null && !fromDb.isEmpty()) {
                    return fromDb;
                }
            } catch (Exception ignored) {
                // Fallback to in-memory store
            }
        }
        return new ArrayList<>(inMemoryStore.values());
    }

    private Optional<NetworkDevice> findDeviceById(String id) {
        if (networkDeviceRepository != null) {
            try {
                Optional<NetworkDevice> fromDb = networkDeviceRepository.findByIdWithLinks(id);
                if (fromDb.isPresent()) {
                    return fromDb;
                }
            } catch (Exception ignored) {
                // Fallback to in-memory store
            }
        }
        return Optional.ofNullable(inMemoryStore.get(id));
    }

    private boolean existsDeviceById(String id) {
        if (id == null) {
            return false;
        }
        if (inMemoryStore.containsKey(id)) {
            return true;
        }
        if (networkDeviceRepository != null) {
            try {
                return networkDeviceRepository.existsById(id);
            } catch (Exception ignored) {
                // Fallback to in-memory store
            }
        }
        return false;
    }

    private NetworkDevice saveDevice(NetworkDevice device) {
        if (device == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save device");
        }
        inMemoryStore.put(device.getId(), device);
        if (networkDeviceRepository != null) {
            try {
                return networkDeviceRepository.save(device);
            } catch (Exception ignored) {
                // Fallback to in-memory store
            }
        }
        return device;
    }
}
