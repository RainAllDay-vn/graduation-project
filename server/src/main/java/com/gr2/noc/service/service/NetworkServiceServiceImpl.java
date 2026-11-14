package com.gr2.noc.service.service;

import com.gr2.noc.service.dto.create.CreateNetworkServiceRequest;
import com.gr2.noc.service.dto.get.NetworkServiceDetails;
import com.gr2.noc.service.dto.get.NetworkServiceSummary;
import com.gr2.noc.service.dto.get.ServiceImpactReport;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.service.model.NetworkService;
import com.gr2.noc.service.repository.NetworkServiceRepository;
import com.gr2.noc.topology.dto.get.DeviceDetails;
import com.gr2.noc.topology.dto.get.DeviceSummary;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.model.NetworkDevice;
import com.gr2.noc.topology.repository.NetworkDeviceRepository;
import com.gr2.noc.topology.service.TopologyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class NetworkServiceServiceImpl implements NetworkServiceService {

    private final NetworkServiceRepository serviceRepository;
    private final NetworkDeviceRepository deviceRepository;
    private final TopologyService topologyService;
    private final Map<String, NetworkService> inMemoryStore = new ConcurrentHashMap<>();

    @Autowired
    public NetworkServiceServiceImpl(
            @Autowired(required = false) NetworkServiceRepository serviceRepository,
            @Autowired(required = false) NetworkDeviceRepository deviceRepository,
            TopologyService topologyService
    ) {
        this.serviceRepository = serviceRepository;
        this.deviceRepository = deviceRepository;
        this.topologyService = topologyService;
    }

    @Override
    public List<NetworkServiceSummary> getServices(ServiceType type, String region, ServiceStatus status, String query) {
        return getAllServices().stream()
                .filter(s -> type == null || s.getType() == type)
                .filter(s -> region == null || region.isBlank() ||
                        (s.getRegion() != null && s.getRegion().toLowerCase().contains(region.toLowerCase())))
                .filter(s -> status == null || s.getStatus() == status)
                .filter(s -> {
                    if (query == null || query.isBlank()) {
                        return true;
                    }
                    String q = query.toLowerCase();
                    String name = s.getName() != null ? s.getName().toLowerCase() : "";
                    String description = s.getDescription() != null ? s.getDescription().toLowerCase() : "";
                    return name.contains(q) || description.contains(q) || s.getId().toLowerCase().contains(q);
                })
                .map(NetworkServiceSummary::from)
                .toList();
    }

    @Override
    public NetworkServiceDetails getServiceById(String id) {
        return findServiceById(id)
                .map(NetworkServiceDetails::from)
                .orElseThrow(() -> notFound(id));
    }

    @Override
    public NetworkServiceDetails createService(CreateNetworkServiceRequest request) {
        if (existsServiceById(request.id())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Service already exists with ID: " + request.id()
            );
        }

        NetworkService service = NetworkService.builder()
                .id(request.id())
                .name(request.name())
                .description(request.description())
                .type(request.type())
                .region(request.region())
                .status(request.status() != null ? request.status() : ServiceStatus.OPERATIONAL)
                .subscriberCount(request.subscriberCount() != null ? request.subscriberCount() : 0)
                .build();

        if (request.dependentDeviceIds() != null) {
            for (String deviceId : request.dependentDeviceIds()) {
                service.addDependentDevice(resolveDevice(deviceId));
            }
        }

        NetworkService saved = saveService(service);
        return NetworkServiceDetails.from(saved);
    }

    @Override
    public NetworkServiceDetails updateServiceStatus(String id, ServiceStatus status) {
        NetworkService service = findServiceById(id)
                .orElseThrow(() -> notFound(id));

        service.setStatus(status);
        NetworkService saved = saveService(service);
        return NetworkServiceDetails.from(saved);
    }

    @Override
    public void deleteService(String id) {
        NetworkService service = findServiceById(id)
                .orElseThrow(() -> notFound(id));

        inMemoryStore.remove(id);
        String serviceId = service.getId();
        if (serviceRepository != null && serviceId != null) {
            try {
                serviceRepository.deleteById(serviceId);
            } catch (Exception ignored) {
                // Fallback to in-memory store only
            }
        }
    }

    @Override
    public ServiceImpactReport getServiceImpact(String id) {
        NetworkService service = findServiceById(id)
                .orElseThrow(() -> notFound(id));

        int active = 0;
        int degraded = 0;
        int outage = 0;
        List<DeviceSummary> affected = new ArrayList<>();

        if (service.getDependentDevices() != null) {
            for (NetworkDevice device : service.getDependentDevices()) {
                switch (healthOf(device)) {
                    case ACTIVE -> active++;
                    case DEGRADED -> {
                        degraded++;
                        DeviceSummary summary = DeviceSummary.from(device);
                        if (summary != null) {
                            affected.add(summary);
                        }
                    }
                    case OUTAGE -> {
                        outage++;
                        DeviceSummary summary = DeviceSummary.from(device);
                        if (summary != null) {
                            affected.add(summary);
                        }
                    }
                }
            }
        }

        String description = String.format(
                "Dịch vụ '%s' phụ thuộc %d thiết bị, trong đó %d hoạt động bình thường, %d suy giảm và %d mất kết nối.",
                service.getName() != null ? service.getName() : service.getId(),
                active + degraded + outage,
                active,
                degraded,
                outage
        );

        return ServiceImpactReport.of(
                service.getId(),
                service.getName(),
                service.getStatus(),
                active,
                degraded,
                outage,
                affected,
                description
        );
    }

    private enum DeviceHealth {
        ACTIVE,
        DEGRADED,
        OUTAGE
    }

    private DeviceHealth healthOf(NetworkDevice device) {
        DeviceStatus status = device.getStatus();
        if (status == DeviceStatus.DEGRADED) {
            return DeviceHealth.DEGRADED;
        }
        if (status == DeviceStatus.CRITICAL || status == DeviceStatus.OFFLINE) {
            return DeviceHealth.OUTAGE;
        }
        return DeviceHealth.ACTIVE;
    }

    private List<NetworkService> getAllServices() {
        if (serviceRepository != null) {
            try {
                List<NetworkService> fromDb = serviceRepository.findAllWithDevices();
                if (fromDb != null && !fromDb.isEmpty()) {
                    return fromDb;
                }
            } catch (Exception ignored) {
                // Fallback to in-memory store
            }
        }
        return new ArrayList<>(inMemoryStore.values());
    }

    private Optional<NetworkService> findServiceById(String id) {
        if (id == null) {
            return Optional.empty();
        }
        if (serviceRepository != null) {
            try {
                Optional<NetworkService> fromDb = serviceRepository.findByIdWithDevices(id);
                if (fromDb.isPresent()) {
                    return fromDb;
                }
            } catch (Exception ignored) {
                // Fallback to in-memory store
            }
        }
        return Optional.ofNullable(inMemoryStore.get(id));
    }

    private boolean existsServiceById(String id) {
        if (id == null) {
            return false;
        }
        if (inMemoryStore.containsKey(id)) {
            return true;
        }
        if (serviceRepository != null) {
            try {
                return serviceRepository.existsById(id);
            } catch (Exception ignored) {
                // Fallback to in-memory store
            }
        }
        return false;
    }

    private NetworkService saveService(NetworkService service) {
        inMemoryStore.put(service.getId(), service);
        if (serviceRepository != null) {
            try {
                return serviceRepository.save(service);
            } catch (Exception ignored) {
                // Fallback to in-memory store only
            }
        }
        return service;
    }

    /**
     * Resolve a device ID to a full NetworkDevice entity.
     * With Neo4j available, the entity is loaded from the repository (preserving
     * its links so persisting the service does not clobber device nodes).
     * Without Neo4j (tests / in-memory mode), a representative entity is
     * rebuilt from the topology service's device details.
     */
    private NetworkDevice resolveDevice(String deviceId) {
        if (deviceId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Dependent device ID must not be null"
            );
        }
        if (deviceRepository != null) {
            try {
                Optional<NetworkDevice> fromDb = deviceRepository.findByIdWithLinks(deviceId);
                if (fromDb.isPresent()) {
                    return fromDb.get();
                }
            } catch (Exception ignored) {
                // Fallback to topology service lookup
            }
        }

        DeviceDetails details = topologyService.getDeviceById(deviceId);
        return NetworkDevice.builder()
                .id(details.id())
                .name(details.name())
                .layer(details.layer())
                .region(details.region())
                .site(details.site())
                .ipAddress(details.ipAddress())
                .model(details.model())
                .status(details.status())
                .accessDeviceCount(details.accessDeviceCount())
                .accessErrorCount(details.accessErrorCount())
                .build();
    }

    private ResponseStatusException notFound(String id) {
        return new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Service not found with ID: " + id
        );
    }
}
