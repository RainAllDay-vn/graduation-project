package com.gr2.noc.service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.service.dto.create.CreateNetworkServiceRequest;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.service.service.NetworkServiceService;
import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.service.TopologyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
@Transactional
class ServiceControllerIntegrationTest {

    private static final String ID_PREFIX = "SVC-CTRL";
    private static final String Q_FILTER = "SVC-CTRL";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TopologyService topologyService;

    @Autowired
    private NetworkServiceService networkServiceService;

    @BeforeEach
    void setUp() {
        // In-memory stores persist across tests in the shared context: clean up first
        topologyService.clearAll();
        networkServiceService.getServices(null, null, null, ID_PREFIX)
                .forEach(s -> networkServiceService.deleteService(s.id()));

        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("SVC-T-CORE-01")
                .name("Test Core 01")
                .layer(DeviceLayer.CORE)
                .region("Miền Bắc")
                .site("POP-01")
                .ipAddress("10.1.0.1")
                .model("ASR 9904")
                .status(DeviceStatus.ACTIVE)
                .build());

        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("SVC-T-EXCH-01")
                .name("Test Exchange 01")
                .layer(DeviceLayer.EXCHANGE)
                .region("Miền Bắc")
                .site("POP-01")
                .ipAddress("10.1.0.2")
                .model("ASR 9904")
                .status(DeviceStatus.DEGRADED)
                .build());
    }

    private MvcResult createService(String suffix, ServiceType type, ServiceStatus status,
                                    String region, List<String> deviceIds) throws Exception {
        CreateNetworkServiceRequest request = CreateNetworkServiceRequest.builder()
                .id(ID_PREFIX + suffix)
                .name("Test Service " + suffix)
                .description("Integration test service " + suffix)
                .type(type)
                .region(region)
                .status(status)
                .subscriberCount(100)
                .dependentDeviceIds(deviceIds)
                .build();

        return mockMvc.perform(post("/api/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();
    }

    @Nested
    @DisplayName("GET /api/services")
    class GetServicesTests {

        @Test
        @DisplayName("Should return empty filtered list when no services match")
        void shouldReturnEmptyListWhenNoMatch() throws Exception {
            mockMvc.perform(get("/api/services").param("q", Q_FILTER + "-NONE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("Should list created services matching the query filter")
        void shouldListCreatedServices() throws Exception {
            createService("-A", ServiceType.INTERNET_TRANSIT, ServiceStatus.OPERATIONAL, "Miền Bắc - Hà Nội", null);
            createService("-B", ServiceType.VOIP, ServiceStatus.OPERATIONAL, "Miền Nam - TP. Hồ Chí Minh", null);

            mockMvc.perform(get("/api/services").param("q", Q_FILTER))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[*].id", hasItems(ID_PREFIX + "-A", ID_PREFIX + "-B")));
        }

        @Test
        @DisplayName("Should filter services by type")
        void shouldFilterByType() throws Exception {
            createService("-A", ServiceType.INTERNET_TRANSIT, ServiceStatus.OPERATIONAL, "Miền Bắc", null);
            createService("-B", ServiceType.VOIP, ServiceStatus.OPERATIONAL, "Miền Bắc", null);

            mockMvc.perform(get("/api/services")
                            .param("q", Q_FILTER)
                            .param("type", "VOIP"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id", is(ID_PREFIX + "-B")))
                    .andExpect(jsonPath("$[0].type", is("VOIP")));
        }

        @Test
        @DisplayName("Should filter services by status")
        void shouldFilterByStatus() throws Exception {
            createService("-A", ServiceType.DNS, ServiceStatus.OPERATIONAL, "Miền Bắc", null);
            createService("-B", ServiceType.DNS, ServiceStatus.DEGRADED, "Miền Bắc", null);

            mockMvc.perform(get("/api/services")
                            .param("q", Q_FILTER)
                            .param("status", "DEGRADED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id", is(ID_PREFIX + "-B")));
        }

        @Test
        @DisplayName("Should filter services by region substring")
        void shouldFilterByRegion() throws Exception {
            createService("-A", ServiceType.IPTV, ServiceStatus.OPERATIONAL, "Miền Bắc - Hà Nội", null);
            createService("-B", ServiceType.IPTV, ServiceStatus.OPERATIONAL, "Miền Nam - TP. Hồ Chí Minh", null);

            mockMvc.perform(get("/api/services")
                            .param("q", Q_FILTER)
                            .param("region", "Bắc"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id", is(ID_PREFIX + "-A")));
        }
    }

    @Nested
    @DisplayName("GET /api/services/{id}")
    class GetServiceByIdTests {

        @Test
        @DisplayName("Should return 200 OK with service details and dependent devices")
        void shouldReturnServiceDetails() throws Exception {
            createService("-DETAIL", ServiceType.VPN_MPLS, ServiceStatus.OPERATIONAL,
                    "Miền Bắc", List.of("SVC-T-CORE-01", "SVC-T-EXCH-01"));

            mockMvc.perform(get("/api/services/{id}", ID_PREFIX + "-DETAIL"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(ID_PREFIX + "-DETAIL")))
                    .andExpect(jsonPath("$.type", is("VPN_MPLS")))
                    .andExpect(jsonPath("$.status", is("OPERATIONAL")))
                    .andExpect(jsonPath("$.subscriberCount", is(100)))
                    .andExpect(jsonPath("$.dependentDevices", hasSize(2)))
                    .andExpect(jsonPath("$.dependentDevices[*].id",
                            hasItems("SVC-T-CORE-01", "SVC-T-EXCH-01")));
        }

        @Test
        @DisplayName("Should return 404 Not Found when service does not exist")
        void shouldReturn404WhenServiceNotFound() throws Exception {
            mockMvc.perform(get("/api/services/{id}", "SVC-NON-EXISTENT"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/services/{id}/impact")
    class ServiceImpactTests {

        @Test
        @DisplayName("Should return impact report with device health counts and affected devices")
        void shouldReturnImpactReport() throws Exception {
            createService("-IMPACT", ServiceType.INTERNET_TRANSIT, ServiceStatus.OPERATIONAL,
                    "Miền Bắc", List.of("SVC-T-CORE-01", "SVC-T-EXCH-01"));

            mockMvc.perform(get("/api/services/{id}/impact", ID_PREFIX + "-IMPACT"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.serviceId", is(ID_PREFIX + "-IMPACT")))
                    .andExpect(jsonPath("$.totalDependentDevices", is(2)))
                    .andExpect(jsonPath("$.activeDevices", is(1)))
                    .andExpect(jsonPath("$.degradedDevices", is(1)))
                    .andExpect(jsonPath("$.outageDevices", is(0)))
                    .andExpect(jsonPath("$.affectedDevices", hasSize(1)))
                    .andExpect(jsonPath("$.affectedDevices[0].id", is("SVC-T-EXCH-01")))
                    .andExpect(jsonPath("$.description", containsString("suy giảm")));
        }

        @Test
        @DisplayName("Should return 404 Not Found when service does not exist")
        void shouldReturn404WhenServiceNotFound() throws Exception {
            mockMvc.perform(get("/api/services/{id}/impact", "SVC-NON-EXISTENT"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/services")
    class CreateServiceTests {

        @Test
        @DisplayName("Should return 201 Created with service details and dependent devices")
        void shouldCreateServiceSuccessfully() throws Exception {
            MvcResult result = createService("-NEW", ServiceType.CLOUD_CONNECT,
                    ServiceStatus.OPERATIONAL, "Miền Bắc", List.of("SVC-T-CORE-01"));

            String body = result.getResponse().getContentAsString();

            assertThat(body)
                    .contains("\"id\":\"" + ID_PREFIX + "-NEW\"")
                    .contains("\"type\":\"CLOUD_CONNECT\"");

            var root = objectMapper.readTree(body);
            assertThat(root.get("dependentDevices").size()).isEqualTo(1);
            assertThat(root.get("dependentDevices").get(0).get("id").asText()).isEqualTo("SVC-T-CORE-01");
        }

        @Test
        @DisplayName("Should return 409 Conflict when service ID already exists")
        void shouldReturn409OnDuplicate() throws Exception {
            createService("-DUP", ServiceType.DNS, ServiceStatus.OPERATIONAL, "Miền Bắc", null);

            CreateNetworkServiceRequest duplicate = CreateNetworkServiceRequest.builder()
                    .id(ID_PREFIX + "-DUP")
                    .name("Duplicate Service")
                    .type(ServiceType.DNS)
                    .build();

            mockMvc.perform(post("/api/services")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(duplicate)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Should return 404 Not Found when a dependent device does not exist")
        void shouldReturn404WhenDependentDeviceMissing() throws Exception {
            CreateNetworkServiceRequest request = CreateNetworkServiceRequest.builder()
                    .id(ID_PREFIX + "-GHOST")
                    .name("Ghost Dependency Service")
                    .type(ServiceType.VOIP)
                    .dependentDeviceIds(List.of("SVC-T-GHOST"))
                    .build();

            mockMvc.perform(post("/api/services")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 400 Bad Request when validation fails")
        void shouldReturn400WhenValidationFails() throws Exception {
            CreateNetworkServiceRequest invalid = CreateNetworkServiceRequest.builder()
                    .id("")
                    .name("")
                    .build();

            mockMvc.perform(post("/api/services")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalid)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PATCH /api/services/{id}/status")
    class UpdateStatusTests {

        @Test
        @DisplayName("Should return 200 OK when updating service status")
        void shouldUpdateServiceStatus() throws Exception {
            createService("-STATUS", ServiceType.IPTV, ServiceStatus.OPERATIONAL, "Miền Bắc", null);

            String body = objectMapper.writeValueAsString(Map.of("status", "OUTAGE"));

            mockMvc.perform(patch("/api/services/{id}/status", ID_PREFIX + "-STATUS")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("OUTAGE")));
        }

        @Test
        @DisplayName("Should return 404 Not Found when service does not exist")
        void shouldReturn404WhenServiceNotFound() throws Exception {
            String body = objectMapper.writeValueAsString(Map.of("status", "OUTAGE"));

            mockMvc.perform(patch("/api/services/{id}/status", "SVC-NON-EXISTENT")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /api/services/{id}")
    class DeleteServiceTests {

        @Test
        @DisplayName("Should return 204 No Content and remove the service")
        void shouldDeleteServiceSuccessfully() throws Exception {
            createService("-DEL", ServiceType.DATACENTER, ServiceStatus.OPERATIONAL, "Miền Nam", null);

            mockMvc.perform(delete("/api/services/{id}", ID_PREFIX + "-DEL"))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/services/{id}", ID_PREFIX + "-DEL"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 404 Not Found when deleting non-existent service")
        void shouldReturn404WhenDeletingNonExistent() throws Exception {
            mockMvc.perform(delete("/api/services/{id}", "SVC-NON-EXISTENT"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Security")
    class SecurityTests {

        @Test
        @WithAnonymousUser
        @DisplayName("Should return 401 Unauthorized for anonymous access")
        void shouldReturn401ForAnonymous() throws Exception {
            mockMvc.perform(get("/api/services"))
                    .andExpect(status().isUnauthorized());
        }
    }
}
