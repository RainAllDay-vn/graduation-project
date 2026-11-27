package com.gr2.noc.service;

import com.gr2.noc.service.dto.create.CreateNetworkServiceRequest;
import com.gr2.noc.service.dto.get.NetworkServiceDetails;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.service.repository.NetworkServiceRepository;
import com.gr2.noc.service.service.NetworkServiceService;
import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.dto.get.DeviceSummary;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.service.TopologyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class ServiceUpsertTest {

    @Autowired
    private NetworkServiceService networkServiceService;

    @Autowired
    private NetworkServiceRepository networkServiceRepository;

    @Autowired
    private TopologyService topologyService;

    @BeforeEach
    void setUp() {
        networkServiceRepository.deleteAll();
        topologyService.clearAll();
        topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("SVC-DEV-1").name("Dev 1").layer(DeviceLayer.CORE).build());
        topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("SVC-DEV-2").name("Dev 2").layer(DeviceLayer.AGGREGATION).build());
    }

    @Test
    @DisplayName("Should upsert service, preserve omitted dependencies, and sync dependencies")
    void shouldUpsertAndSyncDependencies() {
        NetworkServiceDetails created = networkServiceService.upsertService(CreateNetworkServiceRequest.builder()
                .id("SVC-UPS-1")
                .name("Transit North")
                .type(ServiceType.INTERNET_TRANSIT)
                .region("North")
                .subscriberCount(500)
                .dependentDeviceIds(List.of("SVC-DEV-1"))
                .build());
        assertThat(created.status()).isEqualTo(ServiceStatus.OPERATIONAL);
        assertThat(created.dependentDevices()).extracting(DeviceSummary::id).containsExactly("SVC-DEV-1");

        NetworkServiceDetails updated = networkServiceService.upsertService(CreateNetworkServiceRequest.builder()
                .id("SVC-UPS-1")
                .name("Transit North v2")
                .type(ServiceType.INTERNET_TRANSIT)
                .status(ServiceStatus.DEGRADED)
                .build());
        assertThat(updated.name()).isEqualTo("Transit North v2");
        assertThat(updated.region()).isEqualTo("North");
        assertThat(updated.subscriberCount()).isEqualTo(500);
        assertThat(updated.status()).isEqualTo(ServiceStatus.DEGRADED);
        assertThat(updated.dependentDevices()).extracting(DeviceSummary::id).containsExactly("SVC-DEV-1");

        NetworkServiceDetails synced = networkServiceService.syncDependencies(
                "SVC-UPS-1", List.of("SVC-DEV-2", "SVC-DEV-2"));
        assertThat(synced.dependentDevices()).extracting(DeviceSummary::id).containsExactly("SVC-DEV-2");

        NetworkServiceDetails cleared = networkServiceService.syncDependencies("SVC-UPS-1", List.of());
        assertThat(cleared.dependentDevices()).isEmpty();
    }

    @Test
    @DisplayName("Should reject syncDependencies when service or dependent device is missing")
    void shouldRejectMissingServiceOrDevice() {
        assertThatThrownBy(() -> networkServiceService.syncDependencies("MISSING-SVC", List.of("SVC-DEV-1")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        networkServiceService.upsertService(CreateNetworkServiceRequest.builder()
                .id("SVC-UPS-2")
                .name("VoIP")
                .type(ServiceType.VOIP)
                .dependentDeviceIds(List.of("SVC-DEV-1"))
                .build());

        assertThatThrownBy(() -> networkServiceService.syncDependencies("SVC-UPS-2", List.of("MISSING-DEV")))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        // Existing dependency must remain intact when validation fails
        assertThat(networkServiceService.getServiceById("SVC-UPS-2").dependentDevices())
                .extracting(DeviceSummary::id)
                .containsExactly("SVC-DEV-1");
    }
}
