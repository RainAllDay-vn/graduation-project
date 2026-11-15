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
    public TopologyGraph getTopology(DeviceLayer layer, String region) {
        List<NetworkDevice> all = getAllDevices();

        List<NetworkDevice> filtered = all.stream()
                .filter(d -> layer == null || d.getLayer() == layer)
                .filter(d -> region == null || region.isBlank() ||
                        (d.getRegion() != null && d.getRegion().toLowerCase().contains(region.toLowerCase())))
                .toList();

        return TopologyGraph.from(filtered);
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
        List<NetworkDevice> allDevices = getAllDevices();

        // Build undirected adjacency graph for BFS traversal
        Map<String, Set<String>> adjacency = new HashMap<>();
        Map<String, NetworkDevice> deviceMap = new HashMap<>();

        for (NetworkDevice dev : allDevices) {
            deviceMap.put(dev.getId(), dev);
            adjacency.putIfAbsent(dev.getId(), new HashSet<>());
            if (dev.getLinks() != null) {
                for (NetworkLink link : dev.getLinks()) {
                    if (link.getTargetDevice() != null) {
                        String targetId = link.getTargetDevice().getId();
                        adjacency.get(dev.getId()).add(targetId);
                        adjacency.computeIfAbsent(targetId, k -> new HashSet<>()).add(dev.getId());
                    }
                }
            }
        }

        // BFS to find all nodes within effectiveK hops
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();
        Map<String, Integer> distance = new HashMap<>();

        queue.add(focusDevice.getId());
        visited.add(focusDevice.getId());
        distance.put(focusDevice.getId(), 0);

        while (!queue.isEmpty()) {
            String current = queue.poll();
            int currentDist = distance.get(current);

            if (currentDist < effectiveK) {
                for (String neighbor : adjacency.getOrDefault(current, Collections.emptySet())) {
                    if (!visited.contains(neighbor)) {
                        visited.add(neighbor);
                        distance.put(neighbor, currentDist + 1);
                        queue.add(neighbor);
                    }
                }
            }
        }

        List<DeviceSummary> nodes = new ArrayList<>();
        List<LinkSummary> links = new ArrayList<>();

        for (String id : visited) {
            NetworkDevice dev = deviceMap.get(id);
            if (dev != null) {
                nodes.add(DeviceSummary.from(dev));
                if (dev.getLinks() != null) {
                    for (NetworkLink link : dev.getLinks()) {
                        if (link.getTargetDevice() != null && visited.contains(link.getTargetDevice().getId())) {
                            links.add(LinkSummary.from(dev.getId(), link));
                        }
                    }
                }
            }
        }

        return TopologyGraph.of(nodes, links);
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
