package com.gr2.noc.hypothesis.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.hypothesis.dto.create.CreateHypothesisRequest;
import com.gr2.noc.hypothesis.dto.update.UpdateHypothesisStatusRequest;
import com.gr2.noc.hypothesis.enums.HypothesisStatus;
import com.gr2.noc.hypothesis.model.Hypothesis;
import com.gr2.noc.hypothesis.repository.HypothesisRepository;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.IncidentRepository;
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
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
@Transactional
class HypothesisControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private HypothesisRepository hypothesisRepository;

    private Incident testIncident;

    @BeforeEach
    void setUp() {
        testIncident = Incident.builder()
                .id("INC-HYPO-CTRL-01")
                .title("Optical BGP Flapping Issue")
                .description("Investigating optical loss")
                .status(IncidentStatus.INVESTIGATING)
                .severity(Severity.CRITICAL)
                .region("Miền Bắc")
                .primaryDeviceId("SW-HN-02")
                .openedAt(Instant.now())
                .build();
        testIncident = incidentRepository.save(testIncident);
    }

    private Hypothesis createSampleHypothesis(int rank, int matchScore, String title, HypothesisStatus status) {
        Hypothesis hypo = Hypothesis.builder()
                .incident(testIncident)
                .rank(rank)
                .matchScore(matchScore)
                .title(title)
                .shortTitle("Short: " + title)
                .targetType("EDGE")
                .targetId("CORE-02 ↔ AGG-02")
                .sourceNode("CORE-02")
                .targetNode("AGG-02")
                .sourcePort("HundredGigE0/0/1")
                .targetPort("HundredGigE0/0/1")
                .confidenceRationale("Confidence details for " + title)
                .status(status)
                .cliCommand("show interfaces transceiver")
                .verificationCmd("show ip bgp summary")
                .evidence(new java.util.ArrayList<>(List.of("Low RX power -24.2 dBm")))
                .contradictingEvidence(new java.util.ArrayList<>(List.of("Normal CPU")))
                .build();
        return hypothesisRepository.save(hypo);
    }

    @Nested
    @DisplayName("GET /api/incidents/{incidentId}/hypotheses")
    class GetHypothesesTests {

        @Test
        @DisplayName("Should return 200 OK with list of hypotheses ordered by rank")
        void shouldReturnHypothesesOrderedByRank() throws Exception {
            createSampleHypothesis(2, 74, "Transceiver fault", HypothesisStatus.UNDER_CONSIDERATION);
            createSampleHypothesis(1, 88, "Optical attenuation", HypothesisStatus.UNDER_CONSIDERATION);

            mockMvc.perform(get("/api/incidents/{incidentId}/hypotheses", testIncident.getId()))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].rank", is(1)))
                    .andExpect(jsonPath("$[0].title", is("Optical attenuation")))
                    .andExpect(jsonPath("$[0].matchScore", is(88)))
                    .andExpect(jsonPath("$[1].rank", is(2)))
                    .andExpect(jsonPath("$[1].title", is("Transceiver fault")));
        }

        @Test
        @DisplayName("Should filter hypotheses by status")
        void shouldFilterByStatus() throws Exception {
            createSampleHypothesis(1, 88, "Active hypothesis", HypothesisStatus.UNDER_CONSIDERATION);
            createSampleHypothesis(2, 60, "Rejected hypothesis", HypothesisStatus.REJECTED);

            mockMvc.perform(get("/api/incidents/{incidentId}/hypotheses", testIncident.getId())
                            .param("status", "UNDER_CONSIDERATION"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].title", is("Active hypothesis")))
                    .andExpect(jsonPath("$[0].status", is("UNDER_CONSIDERATION")));
        }

        @Test
        @DisplayName("Should return 404 Not Found when incident does not exist")
        void shouldReturn404WhenIncidentNotFound() throws Exception {
            mockMvc.perform(get("/api/incidents/{incidentId}/hypotheses", "NON-EXISTENT"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/incidents/{incidentId}/hypotheses/{hypothesisId}")
    class GetHypothesisByIdTests {

        @Test
        @DisplayName("Should return 200 OK with detailed hypothesis information")
        void shouldReturnHypothesisDetails() throws Exception {
            Hypothesis hypo = createSampleHypothesis(1, 88, "Optical attenuation", HypothesisStatus.UNDER_CONSIDERATION);

            mockMvc.perform(get("/api/incidents/{incidentId}/hypotheses/{hypothesisId}",
                            testIncident.getId(), hypo.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(hypo.getId().intValue())))
                    .andExpect(jsonPath("$.incidentId", is(testIncident.getId())))
                    .andExpect(jsonPath("$.title", is("Optical attenuation")))
                    .andExpect(jsonPath("$.matchScore", is(88)))
                    .andExpect(jsonPath("$.cliCommand", is("show interfaces transceiver")))
                    .andExpect(jsonPath("$.evidence", hasItem("Low RX power -24.2 dBm")))
                    .andExpect(jsonPath("$.contradictingEvidence", hasItem("Normal CPU")));
        }

        @Test
        @DisplayName("Should return 404 Not Found when hypothesis does not exist")
        void shouldReturn404WhenHypothesisNotFound() throws Exception {
            mockMvc.perform(get("/api/incidents/{incidentId}/hypotheses/{hypothesisId}",
                            testIncident.getId(), 999999L))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 404 Not Found when incident does not exist")
        void shouldReturn404WhenIncidentNotFound() throws Exception {
            mockMvc.perform(get("/api/incidents/{incidentId}/hypotheses/{hypothesisId}",
                            "NON-EXISTENT", 1L))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/incidents/{incidentId}/hypotheses")
    class CreateHypothesisTests {

        @Test
        @DisplayName("Should return 201 Created when request is valid")
        void shouldCreateHypothesisSuccessfully() throws Exception {
            CreateHypothesisRequest request = CreateHypothesisRequest.builder()
                    .rank(1)
                    .matchScore(92)
                    .title("BGP peer misconfiguration")
                    .shortTitle("BGP Misconfig")
                    .targetType("NODE")
                    .targetId("SW-HN-02")
                    .confidenceRationale("Hold-time mismatch detected in logs")
                    .cliCommand("show run | section bgp")
                    .verificationCmd("show ip bgp summary")
                    .evidence(List.of("Hold-time expired log event"))
                    .contradictingEvidence(List.of())
                    .build();

            mockMvc.perform(post("/api/incidents/{incidentId}/hypotheses", testIncident.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id", notNullValue()))
                    .andExpect(jsonPath("$.incidentId", is(testIncident.getId())))
                    .andExpect(jsonPath("$.rank", is(1)))
                    .andExpect(jsonPath("$.title", is("BGP peer misconfiguration")))
                    .andExpect(jsonPath("$.status", is("UNDER_CONSIDERATION")));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when validation fails")
        void shouldReturn400WhenValidationFails() throws Exception {
            CreateHypothesisRequest invalidRequest = CreateHypothesisRequest.builder()
                    .rank(null) // invalid null
                    .title("")  // invalid blank
                    .matchScore(null) // invalid null
                    .build();

            mockMvc.perform(post("/api/incidents/{incidentId}/hypotheses", testIncident.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 404 Not Found when creating hypothesis for non-existent incident")
        void shouldReturn404WhenIncidentNotFound() throws Exception {
            CreateHypothesisRequest request = CreateHypothesisRequest.builder()
                    .rank(1)
                    .matchScore(85)
                    .title("Valid title")
                    .build();

            mockMvc.perform(post("/api/incidents/{incidentId}/hypotheses", "NON-EXISTENT")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("PATCH /api/incidents/{incidentId}/hypotheses/{hypothesisId}/status")
    class UpdateHypothesisStatusTests {

        @Test
        @DisplayName("Should return 200 OK when rejecting hypothesis with reason")
        void shouldRejectHypothesisWithReason() throws Exception {
            Hypothesis hypo = createSampleHypothesis(1, 88, "Optical issue", HypothesisStatus.UNDER_CONSIDERATION);

            UpdateHypothesisStatusRequest request = UpdateHypothesisStatusRequest.builder()
                    .status(HypothesisStatus.REJECTED)
                    .reason("Kỹ sư kiểm tra OTDR phát hiện suy hao trên cáp nhảy nội bộ, không phải trục cáp chính.")
                    .build();

            mockMvc.perform(patch("/api/incidents/{incidentId}/hypotheses/{hypothesisId}/status",
                            testIncident.getId(), hypo.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(hypo.getId().intValue())))
                    .andExpect(jsonPath("$.status", is("REJECTED")))
                    .andExpect(jsonPath("$.rejectionReason", containsString("Kỹ sư kiểm tra OTDR")));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when rejecting without reason")
        void shouldReturn400WhenRejectingWithoutReason() throws Exception {
            Hypothesis hypo = createSampleHypothesis(1, 88, "Optical issue", HypothesisStatus.UNDER_CONSIDERATION);

            UpdateHypothesisStatusRequest request = UpdateHypothesisStatusRequest.builder()
                    .status(HypothesisStatus.REJECTED)
                    .reason("   ") // blank reason
                    .build();

            mockMvc.perform(patch("/api/incidents/{incidentId}/hypotheses/{hypothesisId}/status",
                            testIncident.getId(), hypo.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 200 OK when confirming hypothesis and clearing rejectionReason")
        void shouldConfirmHypothesis() throws Exception {
            Hypothesis hypo = createSampleHypothesis(1, 88, "Optical issue", HypothesisStatus.UNDER_CONSIDERATION);
            hypo.setRejectionReason("Previous rejection");
            hypothesisRepository.save(hypo);

            UpdateHypothesisStatusRequest request = UpdateHypothesisStatusRequest.builder()
                    .status(HypothesisStatus.CONFIRMED)
                    .build();

            mockMvc.perform(patch("/api/incidents/{incidentId}/hypotheses/{hypothesisId}/status",
                            testIncident.getId(), hypo.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("CONFIRMED")))
                    .andExpect(jsonPath("$.rejectionReason", nullValue()));
        }

        @Test
        @DisplayName("Should return 200 OK when reopening hypothesis (UNDER_CONSIDERATION)")
        void shouldReopenHypothesis() throws Exception {
            Hypothesis hypo = createSampleHypothesis(1, 88, "Optical issue", HypothesisStatus.REJECTED);
            hypo.setRejectionReason("Some reason");
            hypothesisRepository.save(hypo);

            UpdateHypothesisStatusRequest request = UpdateHypothesisStatusRequest.builder()
                    .status(HypothesisStatus.UNDER_CONSIDERATION)
                    .build();

            mockMvc.perform(patch("/api/incidents/{incidentId}/hypotheses/{hypothesisId}/status",
                            testIncident.getId(), hypo.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("UNDER_CONSIDERATION")))
                    .andExpect(jsonPath("$.rejectionReason", nullValue()));
        }

        @Test
        @DisplayName("Should return 404 Not Found when hypothesis does not exist")
        void shouldReturn404WhenHypothesisNotFound() throws Exception {
            UpdateHypothesisStatusRequest request = UpdateHypothesisStatusRequest.builder()
                    .status(HypothesisStatus.CONFIRMED)
                    .build();

            mockMvc.perform(patch("/api/incidents/{incidentId}/hypotheses/{hypothesisId}/status",
                            testIncident.getId(), 888888L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /api/incidents/{incidentId}/hypotheses/{hypothesisId}")
    class DeleteHypothesisTests {

        @Test
        @DisplayName("Should return 204 No Content when deleting hypothesis successfully")
        void shouldDeleteHypothesisSuccessfully() throws Exception {
            Hypothesis hypo = createSampleHypothesis(1, 88, "Hypothesis to delete", HypothesisStatus.UNDER_CONSIDERATION);

            mockMvc.perform(delete("/api/incidents/{incidentId}/hypotheses/{hypothesisId}",
                            testIncident.getId(), hypo.getId()))
                    .andExpect(status().isNoContent());

            assertThat(hypothesisRepository.findById(hypo.getId())).isEmpty();
        }

        @Test
        @DisplayName("Should return 404 Not Found when deleting non-existent hypothesis")
        void shouldReturn404WhenDeletingNonExistent() throws Exception {
            mockMvc.perform(delete("/api/incidents/{incidentId}/hypotheses/{hypothesisId}",
                            testIncident.getId(), 999999L))
                    .andExpect(status().isNotFound());
        }
    }
}
