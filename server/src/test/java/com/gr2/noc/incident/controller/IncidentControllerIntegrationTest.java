package com.gr2.noc.incident.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.incident.dto.create.CreateIncidentRequest;
import com.gr2.noc.incident.dto.update.UpdateIncidentStatusRequest;
import com.gr2.noc.incident.enums.AlarmType;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Alarm;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.IncidentRepository;
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
import java.time.temporal.ChronoUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser
@Transactional
class IncidentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IncidentRepository incidentRepository;

    private Incident createSampleIncident(String id, String title, IncidentStatus status, Severity severity) {
        Incident incident = Incident.builder()
                .id(id)
                .title(title)
                .description("Test description for " + id)
                .status(status)
                .severity(severity)
                .region("Hà Nội")
                .primaryDeviceId("SW-HN-02")
                .openedAt(Instant.now())
                .build();

        Alarm alarm = Alarm.builder()
                .id("ALM-" + id)
                .deviceId("SW-HN-02")
                .timestamp(Instant.now().minus(2, ChronoUnit.MINUTES))
                .alarmType(AlarmType.FAULT_CODE)
                .faultCode("OPTICS_TEMP_HIGH")
                .severity(severity)
                .message("High optics temperature on port 1")
                .isCurrentIncident(true)
                .build();

        incident.addAlarm(alarm);
        return incidentRepository.save(incident);
    }

    @Nested
    @DisplayName("GET /api/incidents")
    class GetIncidentsTests {

        @Test
        @DisplayName("Should return 200 OK with list of incident summaries")
        void shouldReturnListOfIncidents() throws Exception {
            createSampleIncident("INC-001", "Core link flap", IncidentStatus.INVESTIGATING, Severity.CRITICAL);
            createSampleIncident("INC-002", "BGP degradation", IncidentStatus.OPEN, Severity.WARNING);

            mockMvc.perform(get("/api/incidents"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                    .andExpect(jsonPath("$[*].id", hasItems("INC-001", "INC-002")))
                    .andExpect(jsonPath("$[0].alarmCount", notNullValue()));
        }

        @Test
        @DisplayName("Should filter incidents by status")
        void shouldFilterIncidentsByStatus() throws Exception {
            createSampleIncident("INC-FILTER-1", "Investigating issue", IncidentStatus.INVESTIGATING, Severity.CRITICAL);
            createSampleIncident("INC-FILTER-2", "Resolved issue", IncidentStatus.RESOLVED, Severity.INFO);

            mockMvc.perform(get("/api/incidents")
                            .param("status", "INVESTIGATING"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].status", everyItem(is("INVESTIGATING"))))
                    .andExpect(jsonPath("$[*].id", hasItem("INC-FILTER-1")))
                    .andExpect(jsonPath("$[*].id", not(hasItem("INC-FILTER-2"))));
        }
    }

    @Nested
    @DisplayName("GET /api/incidents/{id}")
    class GetIncidentByIdTests {

        @Test
        @DisplayName("Should return 200 OK with incident details and alarms")
        void shouldReturnIncidentDetails() throws Exception {
            Incident incident = createSampleIncident("INC-DETAIL-1", "Power degradation", IncidentStatus.INVESTIGATING, Severity.CRITICAL);

            mockMvc.perform(get("/api/incidents/{id}", incident.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is("INC-DETAIL-1")))
                    .andExpect(jsonPath("$.title", is("Power degradation")))
                    .andExpect(jsonPath("$.status", is("INVESTIGATING")))
                    .andExpect(jsonPath("$.severity", is("CRITICAL")))
                    .andExpect(jsonPath("$.alarms", hasSize(1)))
                    .andExpect(jsonPath("$.alarms[0].faultCode", is("OPTICS_TEMP_HIGH")));
        }

        @Test
        @DisplayName("Should return 404 Not Found when incident does not exist")
        void shouldReturn404WhenIncidentNotFound() throws Exception {
            mockMvc.perform(get("/api/incidents/{id}", "NON-EXISTENT-ID"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/incidents")
    class CreateIncidentTests {

        @Test
        @DisplayName("Should return 201 Created when request is valid")
        void shouldCreateIncidentSuccessfully() throws Exception {
            CreateIncidentRequest request = CreateIncidentRequest.builder()
                    .id("INC-NEW-01")
                    .title("Optical attenuation spike")
                    .description("Detected excessive optical attenuation on CORE-01")
                    .severity(Severity.CRITICAL)
                    .region("Đà Nẵng")
                    .primaryDeviceId("CORE-DN-01")
                    .build();

            mockMvc.perform(post("/api/incidents")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id", is("INC-NEW-01")))
                    .andExpect(jsonPath("$.title", is("Optical attenuation spike")))
                    .andExpect(jsonPath("$.status", is("OPEN")))
                    .andExpect(jsonPath("$.severity", is("CRITICAL")));

            assertThat(incidentRepository.existsById("INC-NEW-01")).isTrue();
        }

        @Test
        @DisplayName("Should return 400 Bad Request when validation fails")
        void shouldReturn400WhenValidationFails() throws Exception {
            CreateIncidentRequest invalidRequest = CreateIncidentRequest.builder()
                    .id("") // Blank id
                    .title("") // Blank title
                    .severity(null) // Null severity
                    .build();

            mockMvc.perform(post("/api/incidents")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 409 Conflict when incident ID already exists")
        void shouldReturn409WhenDuplicateId() throws Exception {
            createSampleIncident("INC-DUP-01", "Existing", IncidentStatus.OPEN, Severity.WARNING);

            CreateIncidentRequest duplicateRequest = CreateIncidentRequest.builder()
                    .id("INC-DUP-01")
                    .title("Duplicate title")
                    .severity(Severity.WARNING)
                    .build();

            mockMvc.perform(post("/api/incidents")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(duplicateRequest)))
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("PATCH /api/incidents/{id}/status")
    class UpdateIncidentStatusTests {

        @Test
        @DisplayName("Should return 200 OK and set resolvedAt when resolving incident")
        void shouldUpdateStatusAndSetResolvedAt() throws Exception {
            Incident incident = createSampleIncident("INC-PATCH-1", "Patch test", IncidentStatus.INVESTIGATING, Severity.CRITICAL);

            UpdateIncidentStatusRequest request = new UpdateIncidentStatusRequest(IncidentStatus.RESOLVED);

            mockMvc.perform(patch("/api/incidents/{id}/status", incident.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is("INC-PATCH-1")))
                    .andExpect(jsonPath("$.status", is("RESOLVED")))
                    .andExpect(jsonPath("$.resolvedAt", notNullValue()));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when status is null")
        void shouldReturn400WhenStatusNull() throws Exception {
            Incident incident = createSampleIncident("INC-PATCH-2", "Patch test", IncidentStatus.INVESTIGATING, Severity.CRITICAL);

            mockMvc.perform(patch("/api/incidents/{id}/status", incident.getId())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\": null}"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 404 Not Found when patching non-existent incident")
        void shouldReturn404WhenPatchingNonExistent() throws Exception {
            UpdateIncidentStatusRequest request = new UpdateIncidentStatusRequest(IncidentStatus.MITIGATED);

            mockMvc.perform(patch("/api/incidents/{id}/status", "NON-EXISTENT")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/incidents/{id}/alarms")
    class GetAlarmsTests {

        @Test
        @DisplayName("Should return 200 OK with alarms for incident")
        void shouldReturnAlarmsForIncident() throws Exception {
            Incident incident = createSampleIncident("INC-ALM-1", "Alarms check", IncidentStatus.INVESTIGATING, Severity.CRITICAL);

            mockMvc.perform(get("/api/incidents/{id}/alarms", incident.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].deviceId", is("SW-HN-02")))
                    .andExpect(jsonPath("$[0].faultCode", is("OPTICS_TEMP_HIGH")));
        }

        @Test
        @DisplayName("Should return 404 Not Found when incident does not exist")
        void shouldReturn404WhenIncidentNotFound() throws Exception {
            mockMvc.perform(get("/api/incidents/{id}/alarms", "NON-EXISTENT"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /api/incidents/{id}/alarms/{alarmId}")
    class GetAlarmDetailsTests {

        @Test
        @DisplayName("Should return 200 OK with alarm details")
        void shouldReturnAlarmDetails() throws Exception {
            Incident incident = createSampleIncident("INC-ALMDETAIL-1", "Alarm detail check", IncidentStatus.INVESTIGATING, Severity.CRITICAL);
            String alarmId = incident.getAlarms().get(0).getId();

            mockMvc.perform(get("/api/incidents/{id}/alarms/{alarmId}", incident.getId(), alarmId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(alarmId)))
                    .andExpect(jsonPath("$.incidentId", is(incident.getId())))
                    .andExpect(jsonPath("$.deviceId", is("SW-HN-02")))
                    .andExpect(jsonPath("$.faultCode", is("OPTICS_TEMP_HIGH")));
        }

        @Test
        @DisplayName("Should return 404 Not Found when alarm does not belong to incident")
        void shouldReturn404WhenAlarmNotFoundUnderIncident() throws Exception {
            Incident incident = createSampleIncident("INC-ALMDETAIL-2", "Alarm detail check", IncidentStatus.INVESTIGATING, Severity.CRITICAL);

            mockMvc.perform(get("/api/incidents/{id}/alarms/{alarmId}", incident.getId(), "NON-EXISTENT-ALARM"))
                    .andExpect(status().isNotFound());
        }
    }
}
