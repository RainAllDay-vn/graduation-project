package com.gr2.noc.ai.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser
class AiInvestigationControllerIntegrationTest {

    private static final String RUN_URL = "/api/incidents/{incidentId}/investigation/run";
    private static final String LATEST_URL = "/api/incidents/{incidentId}/investigation/latest";

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithAnonymousUser
    void anonymousUserShouldNotTriggerInvestigation() throws Exception {
        mockMvc.perform(post(RUN_URL, "INC-ANY")).andExpect(status().isUnauthorized());
    }

    @Test
    @WithAnonymousUser
    void anonymousUserShouldNotReadLatestInvestigation() throws Exception {
        mockMvc.perform(get(LATEST_URL, "INC-ANY")).andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRunInvestigationAndReturnFallbackHypothesis() throws Exception {
        String incidentId = createIncident();

        mockMvc.perform(post(RUN_URL, incidentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidentId").value(incidentId))
                .andExpect(jsonPath("$.engineType").value("rule-based"))
                .andExpect(jsonPath("$.duration").exists())
                .andExpect(jsonPath("$.consultedRunbooks").isArray())
                .andExpect(jsonPath("$.hypotheses.length()").value(1))
                .andExpect(jsonPath("$.hypotheses[0].rank").value(1))
                .andExpect(jsonPath("$.hypotheses[0].matchScore").value(40))
                .andExpect(jsonPath("$.hypotheses[0].evidence").isNotEmpty());

        mockMvc.perform(get(LATEST_URL, incidentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidentId").value(incidentId))
                .andExpect(jsonPath("$.hypotheses.length()").value(1))
                .andExpect(jsonPath("$.hypotheses[0].rank").value(1))
                .andExpect(jsonPath("$.hypotheses[0].matchScore").value(40));
    }

    @Test
    void shouldAccumulateHypothesesAcrossRuns() throws Exception {
        String incidentId = createIncident();

        mockMvc.perform(post(RUN_URL, incidentId)).andExpect(status().isOk());
        mockMvc.perform(post(RUN_URL, incidentId)).andExpect(status().isOk());

        mockMvc.perform(get(LATEST_URL, incidentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hypotheses.length()").value(2));
    }

    @Test
    void shouldReturn404ForUnknownIncident() throws Exception {
        mockMvc.perform(post(RUN_URL, "INC-NOPE")).andExpect(status().isNotFound());
        mockMvc.perform(get(LATEST_URL, "INC-NOPE")).andExpect(status().isNotFound());
    }

    @Test
    void shouldReturn409ForResolvedIncident() throws Exception {
        String incidentId = createIncident();

        mockMvc.perform(patch("/api/incidents/{id}/status", incidentId)
                        .contentType("application/json")
                        .content("{\"status\":\"RESOLVED\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(post(RUN_URL, incidentId)).andExpect(status().isConflict());
    }

    private String createIncident() throws Exception {
        String incidentId = "INC-AI-" + System.nanoTime();
        mockMvc.perform(post("/api/incidents")
                        .contentType("application/json")
                        .content("""
                                {
                                  "id": "%s",
                                  "title": "AI investigation test incident",
                                  "severity": "WARNING",
                                  "region": "HN",
                                  "primaryDeviceId": "DEV-AI-%s"
                                }
                                """.formatted(incidentId, incidentId)))
                .andExpect(status().isCreated());
        return incidentId;
    }
}
