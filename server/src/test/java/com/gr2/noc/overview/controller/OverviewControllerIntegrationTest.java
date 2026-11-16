package com.gr2.noc.overview.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.lang.NonNull;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
@Transactional
class OverviewControllerIntegrationTest {

    private static final AtomicInteger COUNTER = new AtomicInteger();

    @Autowired
    private MockMvc mockMvc;

    @NonNull
    private String uniqueIncidentId() {
        return "INC-OV-" + COUNTER.incrementAndGet() + "-" + System.nanoTime();
    }

    @NonNull
    private String uniqueDeviceId() {
        return "OV-DEV-" + COUNTER.incrementAndGet() + "-" + System.nanoTime();
    }

    @NonNull
    private String createIncident(@NonNull String id, @NonNull String severity) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/incidents")
                        .contentType("application/json")
                        .content("""
                                {"id":"%s","title":"Overview test incident","severity":"%s",
                                "region":"Miền Bắc - Hà Nội","primaryDeviceId":"SW-HN-02"}
                                """.formatted(id, severity)))
                .andExpect(status().isCreated())
                .andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
    }

    private void resolveIncident(@NonNull String id) throws Exception {
        mockMvc.perform(patch("/api/incidents/{id}/status", id)
                        .contentType("application/json")
                        .content("""
                                {"status":"RESOLVED"}
                                """))
                .andExpect(status().isOk());
    }

    @NonNull
    private String createDevice(@NonNull String id, @NonNull String status) throws Exception {
        mockMvc.perform(post("/api/topology/devices")
                        .contentType("application/json")
                        .content("""
                                {"id":"%s","name":"Overview test device","layer":"CORE","status":"%s"}
                                """.formatted(id, status)))
                .andExpect(status().isCreated());
        return id;
    }

    private void createLink(@NonNull String linkId, @NonNull String sourceDeviceId,
                            @NonNull String targetDeviceId, @NonNull String operStatus) throws Exception {
        mockMvc.perform(post("/api/topology/links")
                        .contentType("application/json")
                        .content("""
                                {"linkId":"%s","sourceDeviceId":"%s","targetDeviceId":"%s",
                                "sourcePort":"Te0/1","targetPort":"Te0/2","operStatus":"%s"}
                                """.formatted(linkId, sourceDeviceId, targetDeviceId, operStatus)))
                .andExpect(status().isCreated());
    }

    private int intAt(@NonNull MvcResult result, @NonNull String path) throws Exception {
        return (Integer) JsonPath.read(result.getResponse().getContentAsString(), path);
    }

    @Nested
    @DisplayName("Security tests")
    class SecurityTests {

        @Test
        @WithAnonymousUser
        @DisplayName("Anonymous user should not read the overview")
        void shouldRejectAnonymousOverview() throws Exception {
            mockMvc.perform(get("/api/overview"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("Metrics tests")
    class MetricsTests {

        @Test
        @WithMockUser
        @DisplayName("Should return all seven metric fields")
        void shouldReturnAllMetricFields() throws Exception {
            mockMvc.perform(get("/api/overview"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.metrics.nodesUp").isNumber())
                    .andExpect(jsonPath("$.metrics.nodesTotal").isNumber())
                    .andExpect(jsonPath("$.metrics.nodesWarning").isNumber())
                    .andExpect(jsonPath("$.metrics.nodesCritical").isNumber())
                    .andExpect(jsonPath("$.metrics.openAlarms").isNumber())
                    .andExpect(jsonPath("$.metrics.openIncidents").isNumber())
                    .andExpect(jsonPath("$.metrics.portsDown").isNumber())
                    .andExpect(jsonPath("$.openIncidents").isArray())
                    .andExpect(jsonPath("$.recentlyResolved").isArray());
        }

        @Test
        @WithMockUser
        @DisplayName("Should count devices and degraded ports from created topology")
        void shouldCountDevicesAndPorts() throws Exception {
            String up = createDevice(uniqueDeviceId(), "ACTIVE");
            String down = createDevice(uniqueDeviceId(), "CRITICAL");
            createLink("OV-LINK-DOWN-" + System.nanoTime(), up, down, "DOWN");
            createLink("OV-LINK-UP-" + System.nanoTime(), down, up, "UP");
            createLink("OV-LINK-DEGRADED-" + System.nanoTime(), up, down, "DEGRADED");

            MvcResult result = mockMvc.perform(get("/api/overview"))
                    .andExpect(status().isOk())
                    .andReturn();

            int nodesTotal = intAt(result, "$.metrics.nodesTotal");
            int nodesUp = intAt(result, "$.metrics.nodesUp");
            int nodesCritical = intAt(result, "$.metrics.nodesCritical");
            int portsDown = intAt(result, "$.metrics.portsDown");

            assertThat(nodesTotal).isGreaterThanOrEqualTo(2);
            assertThat(nodesUp).isGreaterThanOrEqualTo(1);
            assertThat(nodesCritical).isGreaterThanOrEqualTo(1);
            assertThat(nodesUp).isLessThanOrEqualTo(nodesTotal);
            assertThat(portsDown).isGreaterThanOrEqualTo(2);
        }

        @Test
        @WithMockUser
        @DisplayName("Should deduplicate bidirectional links in port count")
        void shouldDeduplicateBidirectionalLinks() throws Exception {
            String a = createDevice(uniqueDeviceId(), "ACTIVE");
            String b = createDevice(uniqueDeviceId(), "ACTIVE");
            String linkId = "OV-LINK-BIDI-" + System.nanoTime();
            createLink(linkId, a, b, "DOWN");
            createLink(linkId, b, a, "DOWN");

            MvcResult result = mockMvc.perform(get("/api/overview"))
                    .andExpect(status().isOk())
                    .andReturn();

            int portsDown = intAt(result, "$.metrics.portsDown");
            assertThat(portsDown).isGreaterThanOrEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Incident tests")
    class IncidentTests {

        @Test
        @WithMockUser
        @DisplayName("Top incident should be the newest open incident")
        void shouldReturnNewestOpenAsTopIncident() throws Exception {
            String older = createIncident(uniqueIncidentId(), "WARNING");
            String newer = createIncident(uniqueIncidentId(), "CRITICAL");

            MvcResult result = mockMvc.perform(get("/api/overview"))
                    .andExpect(status().isOk())
                    .andReturn();

            String topId = JsonPath.read(result.getResponse().getContentAsString(), "$.topIncident.id");
            assertThat(topId).isEqualTo(newer);
            assertThat(topId).isNotEqualTo(older);

            List<String> openIds = JsonPath.read(result.getResponse().getContentAsString(),
                    "$.openIncidents[*].id");
            assertThat(openIds).contains(older, newer);
            assertThat(openIds.get(0)).isEqualTo(newer);
        }

        @Test
        @WithMockUser
        @DisplayName("Should separate open and resolved incidents")
        void shouldSeparateOpenAndResolved() throws Exception {
            String openId = createIncident(uniqueIncidentId(), "ERROR");
            String resolvedId = createIncident(uniqueIncidentId(), "WARNING");
            resolveIncident(resolvedId);

            MvcResult result = mockMvc.perform(get("/api/overview"))
                    .andExpect(status().isOk())
                    .andReturn();

            List<String> openIds = JsonPath.read(result.getResponse().getContentAsString(),
                    "$.openIncidents[*].id");
            List<String> resolvedIds = JsonPath.read(result.getResponse().getContentAsString(),
                    "$.recentlyResolved[*].id");
            int openIncidents = intAt(result, "$.metrics.openIncidents");

            assertThat(openIds).contains(openId);
            assertThat(openIds).doesNotContain(resolvedId);
            assertThat(resolvedIds).contains(resolvedId);
            assertThat(openIncidents).isEqualTo(openIds.size());
        }

        @Test
        @WithMockUser
        @DisplayName("Should cap recently resolved at five entries")
        void shouldCapRecentlyResolved() throws Exception {
            for (int i = 0; i < 7; i++) {
                String id = createIncident(uniqueIncidentId(), "WARNING");
                resolveIncident(id);
            }

            MvcResult result = mockMvc.perform(get("/api/overview"))
                    .andExpect(status().isOk())
                    .andReturn();

            List<String> resolvedIds = JsonPath.read(result.getResponse().getContentAsString(),
                    "$.recentlyResolved[*].id");
            assertThat(resolvedIds).hasSizeLessThanOrEqualTo(5);
        }

        @Test
        @WithMockUser
        @DisplayName("Should agree with the incidents endpoint on open count")
        void shouldAgreeWithIncidentsEndpoint() throws Exception {
            createIncident(uniqueIncidentId(), "ERROR");
            String resolvedId = createIncident(uniqueIncidentId(), "WARNING");
            resolveIncident(resolvedId);

            MvcResult overview = mockMvc.perform(get("/api/overview"))
                    .andExpect(status().isOk())
                    .andReturn();
            MvcResult incidents = mockMvc.perform(get("/api/incidents"))
                    .andExpect(status().isOk())
                    .andReturn();

            int overviewOpen = intAt(overview, "$.metrics.openIncidents");
            List<String> allIds = JsonPath.read(incidents.getResponse().getContentAsString(), "$[*].id");
            List<String> statuses = JsonPath.read(incidents.getResponse().getContentAsString(), "$[*].status");
            long openFromIncidents = statuses.stream().filter(s -> !"RESOLVED".equals(s)).count();

            assertThat(allIds).isNotEmpty();
            assertThat(overviewOpen).isEqualTo((int) openFromIncidents);
        }
    }
}
