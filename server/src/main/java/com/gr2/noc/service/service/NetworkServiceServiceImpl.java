package com.gr2.noc.service.service;

import com.gr2.noc.service.dto.create.CreateNetworkServiceRequest;
import com.gr2.noc.service.dto.get.NetworkServiceDetails;
import com.gr2.noc.service.dto.get.NetworkServiceSummary;
import com.gr2.noc.service.dto.get.ServiceImpactReport;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.service.model.NetworkService;
import com.gr2.noc.service.repository.NetworkServiceRepository;
import com.gr2.noc.topology.dto.get.DeviceSummary;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.model.NetworkDevice;
import com.gr2.noc.topology.repository.NetworkDeviceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class NetworkServiceServiceImpl implements NetworkServiceService {

    private final NetworkServiceRepository serviceRepository;
    private final NetworkDeviceRepository deviceRepository;

    public NetworkServiceServiceImpl(
            NetworkServiceRepository serviceRepository,
            NetworkDeviceRepository deviceRepository
    ) {
        this.serviceRepository = serviceRepository;
        this.deviceRepository = deviceRepository;
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

        serviceRepository.deleteById(service.getId());
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
        return serviceRepository.findAllWithDevices();
    }

    private Optional<NetworkService> findServiceById(String id) {
        if (id == null) {
            return Optional.empty();
        }
        return serviceRepository.findByIdWithDevices(id);
    }

    private boolean existsServiceById(String id) {
        return id != null && serviceRepository.existsById(id);
    }

    private NetworkService saveService(NetworkService service) {
        if (service == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save service");
        }
        return serviceRepository.save(service);
    }

    /**
     * Resolve a device ID to a full NetworkDevice entity loaded from the
     * repository (preserving its links so persisting the service does not
     * clobber device nodes).
     */
    private NetworkDevice resolveDevice(String deviceId) {
        if (deviceId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Dependent device ID must not be null"
            );
        }
        return deviceRepository.findByIdWithLinks(deviceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Dependent device not found with ID: " + deviceId
                ));
    }

    private ResponseStatusException notFound(String id) {
        return new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Service not found with ID: " + id
        );
    }
}
