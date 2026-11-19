package com.gr2.noc.topology.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.IncidentRepository;
import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.dto.create.CreateLinkRequest;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.enums.LinkType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
@Transactional
class TopologyControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private com.gr2.noc.topology.service.TopologyService topologyService;

    @BeforeEach
    void setUp() throws Exception {
        topologyService.clearAll();

        // Register test devices
        CreateDeviceRequest dev1 = CreateDeviceRequest.builder()
                .id("TEST-CORE-01")
                .name("Test Core 01")
                .layer(DeviceLayer.CORE)
                .region("Miền Bắc")
                .site("POP-01")
                .ipAddress("10.1.0.1")
                .model("ASR 9904")
                .status(DeviceStatus.ACTIVE)
                .build();

        CreateDeviceRequest dev2 = CreateDeviceRequest.builder()
                .id("TEST-AGG-01")
                .name("Test Agg 01")
                .layer(DeviceLayer.AGGREGATION)
                .region("Miền Bắc")
                .site("POP-01")
                .ipAddress("10.1.1.1")
                .model("Nexus 9336C")
                .status(DeviceStatus.DEGRADED)
                .accessDeviceCount(10)
                .accessErrorCount(1)
                .build();

        CreateDeviceRequest dev3 = CreateDeviceRequest.builder()
                .id("TEST-EXCH-01")
                .name("Test Exch 01")
                .layer(DeviceLayer.EXCHANGE)
                .region("Miền Bắc")
                .site("POP-02")
                .ipAddress("10.1.2.1")
                .model("NE40E")
                .status(DeviceStatus.ACTIVE)
                .accessDeviceCount(20)
                .build();

        CreateDeviceRequest dev4 = CreateDeviceRequest.builder()
                .id("TEST-CORE-02")
                .name("Test Core 02")
                .layer(DeviceLayer.CORE)
                .region("Miền Nam")
                .site("POP-03")
                .ipAddress("10.1.0.2")
                .model("ASR 9904")
                .status(DeviceStatus.ACTIVE)
                .build();

        mockMvc.perform(post("/api/topology/devices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dev1)));

        mockMvc.perform(post("/api/topology/devices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dev2)));

        mockMvc.perform(post("/api/topology/devices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dev3)));

        mockMvc.perform(post("/api/topology/devices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dev4)));

        // Register test links
        CreateLinkRequest link1 = CreateLinkRequest.builder()
                .linkId("TEST-LINK-AGG-CORE")
                .sourceDeviceId("TEST-AGG-01")
                .targetDeviceId("TEST-CORE-01")
                .sourcePort("HundredGigE0/0/1")
                .targetPort("HundredGigE0/0/1")
                .linkType(LinkType.PHYSICAL_FIBER)
                .capacityGbps(100)
                .operStatus("DEGRADED")
                .rxPowerDbm(-24.2)
                .txPowerDbm(1.2)
                .utilizationPercent(75.0)
                .isBackup(false)
                .build();

        CreateLinkRequest link2 = CreateLinkRequest.builder()
                .linkId("TEST-LINK-EXCH-AGG")
                .sourceDeviceId("TEST-AGG-01")
                .targetDeviceId("TEST-EXCH-01")
                .sourcePort("TenGigE0/1/1")
                .targetPort("TenGigE0/0/1")
                .linkType(LinkType.PHYSICAL_FIBER)
                .capacityGbps(40)
                .operStatus("UP")
                .rxPowerDbm(-12.0)
                .txPowerDbm(1.0)
                .utilizationPercent(40.0)
                .isBackup(false)
                .build();

        CreateLinkRequest link3 = CreateLinkRequest.builder()
                .linkId("TEST-LINK-CORE-CORE")
                .sourceDeviceId("TEST-CORE-01")
                .targetDeviceId("TEST-CORE-02")
                .sourcePort("HundredGigE0/0/2")
                .targetPort("HundredGigE0/0/2")
                .linkType(LinkType.PHYSICAL_FIBER)
                .capacityGbps(100)
                .operStatus("UP")
                .isBackup(false)
                .build();

        mockMvc.perform(post("/api/topology/links")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(link1)));

        mockMvc.perform(post("/api/topology/links")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(link2)));

        mockMvc.perform(post("/api/topology/links")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(link3)));
    }

    @Nested
    @DisplayName("GET /api/topology")
    class GetTopologyTests {

        @Test
        @DisplayName("Should return graph centered on focus node within kHop radius")
        void shouldReturnCenteredGraphFromFocusNode() throws Exception {
            mockMvc.perform(get("/api/topology")
                            .param("focusNodeIds", "TEST-AGG-01")
                            .param("kHop", "1"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.nodes[*].id", hasItems("TEST-AGG-01", "TEST-CORE-01", "TEST-EXCH-01")))
                    .andExpect(jsonPath("$.links", hasSize(greaterThanOrEqualTo(2))));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when no starting points are provided")
        void shouldReturn400WhenNoStartingPoints() throws Exception {
            mockMvc.perform(get("/api/topology"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 404 Not Found when focusNodeId does not exist")
        void shouldReturn404WhenFocusNodeNotFound() throws Exception {
            mockMvc.perform(get("/api/topology").param("focusNodeIds", "NON-EXISTENT"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should use all devices of focusLayer as starting points")
        void shouldUseFocusLayerAsStartingPoints() throws Exception {
            mockMvc.perform(get("/api/topology")
                            .param("focusLayer", "CORE")
                            .param("kHop", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nodes[*].id", hasItems("TEST-CORE-01", "TEST-AGG-01")));
        }

        @Test
        @DisplayName("Should cap returned graph at maxNodes keeping the closest nodes")
        void shouldCapGraphAtMaxNodes() throws Exception {
            mockMvc.perform(get("/api/topology")
                            .param("focusNodeIds", "TEST-AGG-01")
                            .param("kHop", "1")
                            .param("maxNodes", "2"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nodes", hasSize(2)))
                    .andExpect(jsonPath("$.nodes[*].id", hasItem("TEST-AGG-01")));
        }

        @Test
        @DisplayName("Should union neighborhoods of multiple focus nodes")
        void shouldUnionNeighborhoodsOfMultipleFocusNodes() throws Exception {
            mockMvc.perform(get("/api/topology")
                            .param("focusNodeIds", "TEST-CORE-01,TEST-EXCH-01")
                            .param("kHop", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nodes[*].id",
                            hasItems("TEST-CORE-01", "TEST-EXCH-01", "TEST-AGG-01", "TEST-CORE-02")))
                    .andExpect(jsonPath("$.nodes[*].id", not(hasItem("UNKNOWN-DEVICE"))));
        }

        @Test
        @DisplayName("Should apply layer as traversal filter while keeping start points")
        void shouldApplyLayerTraversalFilter() throws Exception {
            mockMvc.perform(get("/api/topology")
                            .param("focusNodeIds", "TEST-AGG-01")
                            .param("kHop", "1")
                            .param("layer", "CORE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nodes[*].id", hasItems("TEST-AGG-01", "TEST-CORE-01")))
                    .andExpect(jsonPath("$.nodes[*].id", not(hasItem("TEST-EXCH-01"))));
        }

        @Test
        @DisplayName("Should apply region as traversal filter while keeping start points")
        void shouldApplyRegionTraversalFilter() throws Exception {
            mockMvc.perform(get("/api/topology")
                            .param("focusNodeIds", "TEST-CORE-01")
                            .param("kHop", "1")
                            .param("region", "Miền Nam"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nodes[*].id", hasItems("TEST-CORE-01", "TEST-CORE-02")))
                    .andExpect(jsonPath("$.nodes[*].id", not(hasItem("TEST-AGG-01"))));
        }
    }

    @Nested
    @DisplayName("GET /api/topology/subgraph")
    class GetSubgraphTests {

        @Test
        @DisplayName("Should return 1-hop subgraph around focusNodeId")
        void shouldReturn1HopSubgraphByNodeId() throws Exception {
            mockMvc.perform(get("/api/topology/subgraph")
                            .param("focusNodeId", "TEST-AGG-01")
                            .param("kHop", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nodes[*].id", hasItems("TEST-AGG-01", "TEST-CORE-01", "TEST-EXCH-01")))
                    .andExpect(jsonPath("$.links", hasSize(greaterThanOrEqualTo(2))));
        }

        @Test
        @DisplayName("Should return 1-hop subgraph centered at incident epicenter")
        void shouldReturnSubgraphByIncidentId() throws Exception {
            Incident incident = Incident.builder()
                    .id("INC-TOPO-TEST-01")
                    .title("Incident for topology test")
                    .severity(Severity.CRITICAL)
                    .status(IncidentStatus.INVESTIGATING)
                    .primaryDeviceId("TEST-AGG-01")
                    .openedAt(Instant.now())
                    .build();
            incidentRepository.save(incident);

            mockMvc.perform(get("/api/topology/subgraph")
                            .param("incidentId", "INC-TOPO-TEST-01")
                            .param("kHop", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.nodes[*].id", hasItem("TEST-AGG-01")));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when neither focusNodeId nor incidentId is provided")
        void shouldReturn400WhenNoParam() throws Exception {
            mockMvc.perform(get("/api/topology/subgraph"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 404 Not Found when focusNodeId does not exist")
        void shouldReturn404WhenNodeNotFound() throws Exception {
            mockMvc.perform(get("/api/topology/subgraph").param("focusNodeId", "NON-EXISTENT"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/topology/devices/{id}")
    class GetDeviceByIdTests {

        @Test
        @DisplayName("Should return 200 OK with detailed device info")
        void shouldReturnDeviceDetails() throws Exception {
            mockMvc.perform(get("/api/topology/devices/{id}", "TEST-AGG-01"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is("TEST-AGG-01")))
                    .andExpect(jsonPath("$.layer", is("AGGREGATION")))
                    .andExpect(jsonPath("$.status", is("DEGRADED")))
                    .andExpect(jsonPath("$.accessDeviceCount", is(10)))
                    .andExpect(jsonPath("$.links", hasSize(2)));
        }

        @Test
        @DisplayName("Should return 404 Not Found when device does not exist")
        void shouldReturn404WhenDeviceNotFound() throws Exception {
            mockMvc.perform(get("/api/topology/devices/{id}", "UNKNOWN-DEVICE"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/topology/devices")
    class SearchDevicesTests {

        @Test
        @DisplayName("Should return paged directory sorted by device id")
        void shouldReturnPagedDirectory() throws Exception {
            mockMvc.perform(get("/api/topology/devices")
                            .param("page", "0")
                            .param("size", "2"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements", is(4)))
                    .andExpect(jsonPath("$.totalPages", is(2)))
                    .andExpect(jsonPath("$.content", hasSize(2)))
                    .andExpect(jsonPath("$.content[0].id", is("TEST-AGG-01")))
                    .andExpect(jsonPath("$.content[1].id", is("TEST-CORE-01")));
        }

        @Test
        @DisplayName("Should search by device id or name case-insensitively")
        void shouldSearchByIdOrName() throws Exception {
            mockMvc.perform(get("/api/topology/devices").param("search", "exch"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements", is(1)))
                    .andExpect(jsonPath("$.content[0].id", is("TEST-EXCH-01")));

            mockMvc.perform(get("/api/topology/devices").param("search", "Agg"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements", is(1)))
                    .andExpect(jsonPath("$.content[0].id", is("TEST-AGG-01")));
        }

        @Test
        @DisplayName("Should filter by layer and region")
        void shouldFilterByLayerAndRegion() throws Exception {
            mockMvc.perform(get("/api/topology/devices").param("layer", "CORE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements", is(2)));

            mockMvc.perform(get("/api/topology/devices").param("region", "Miền Nam"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalElements", is(1)))
                    .andExpect(jsonPath("$.content[0].id", is("TEST-CORE-02")));
        }

        @Test
        @DisplayName("Should return empty content when page is out of range")
        void shouldReturnEmptyContentWhenPageOutOfRange() throws Exception {
            mockMvc.perform(get("/api/topology/devices")
                            .param("page", "9")
                            .param("size", "2"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)))
                    .andExpect(jsonPath("$.totalElements", is(4)));
        }
    }

    @Nested
    @DisplayName("GET /api/topology/blast-radius/{deviceId}")
    class BlastRadiusTests {

        @Test
        @DisplayName("Should return 200 OK with calculated blast radius report")
        void shouldCalculateBlastRadius() throws Exception {
            mockMvc.perform(get("/api/topology/blast-radius/{deviceId}", "TEST-AGG-01"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.rootCauseDeviceId", is("TEST-AGG-01")))
                    .andExpect(jsonPath("$.affectedDeviceIds", hasItems("TEST-AGG-01", "TEST-CORE-01", "TEST-EXCH-01")))
                    .andExpect(jsonPath("$.estimatedAffectedSubscribers", greaterThan(0)));
        }

        @Test
        @DisplayName("Should return 404 Not Found when device does not exist")
        void shouldReturn404WhenDeviceNotFound() throws Exception {
            mockMvc.perform(get("/api/topology/blast-radius/{deviceId}", "UNKNOWN"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/topology/devices")
    class CreateDeviceTests {

        @Test
        @DisplayName("Should return 201 Created when request is valid")
        void shouldCreateDevice() throws Exception {
            CreateDeviceRequest request = CreateDeviceRequest.builder()
                    .id("NEW-DEV-01")
                    .name("New Device")
                    .layer(DeviceLayer.ACCESS)
                    .build();

            mockMvc.perform(post("/api/topology/devices")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id", is("NEW-DEV-01")))
                    .andExpect(jsonPath("$.layer", is("ACCESS")));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when required fields missing")
        void shouldReturn400WhenInvalid() throws Exception {
            CreateDeviceRequest request = CreateDeviceRequest.builder()
                    .id("")
                    .name("")
                    .build();

            mockMvc.perform(post("/api/topology/devices")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 409 Conflict when device ID exists")
        void shouldReturn409WhenDuplicate() throws Exception {
            CreateDeviceRequest request = CreateDeviceRequest.builder()
                    .id("TEST-CORE-01")
                    .name("Duplicate Core")
                    .layer(DeviceLayer.CORE)
                    .build();

            mockMvc.perform(post("/api/topology/devices")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("POST /api/topology/links")
    class CreateLinkTests {

        @Test
        @DisplayName("Should return 201 Created when link request is valid")
        void shouldCreateLink() throws Exception {
            CreateLinkRequest request = CreateLinkRequest.builder()
                    .linkId("NEW-LINK-01")
                    .sourceDeviceId("TEST-CORE-01")
                    .targetDeviceId("TEST-AGG-01")
                    .sourcePort("GigE0/1")
                    .targetPort("GigE0/1")
                    .build();

            mockMvc.perform(post("/api/topology/links")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.linkId", is("NEW-LINK-01")))
                    .andExpect(jsonPath("$.sourceDeviceId", is("TEST-CORE-01")))
                    .andExpect(jsonPath("$.targetDeviceId", is("TEST-AGG-01")));
        }

        @Test
        @DisplayName("Should return 404 Not Found when connecting to non-existent target device")
        void shouldReturn404WhenTargetNotFound() throws Exception {
            CreateLinkRequest request = CreateLinkRequest.builder()
                    .linkId("FAIL-LINK")
                    .sourceDeviceId("TEST-CORE-01")
                    .targetDeviceId("NON-EXISTENT")
                    .sourcePort("GigE0/1")
                    .targetPort("GigE0/1")
                    .build();

            mockMvc.perform(post("/api/topology/links")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }
}
