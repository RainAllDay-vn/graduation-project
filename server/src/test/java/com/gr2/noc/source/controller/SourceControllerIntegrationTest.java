package com.gr2.noc.source.controller;

import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.enums.SyncTriggerType;
import com.gr2.noc.source.model.SourceSyncRecord;
import com.gr2.noc.source.repository.SourceSyncRecordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.lang.NonNull;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@WithMockUser
@Transactional
class SourceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SourceSyncRecordRepository syncRecordRepository;

    @NonNull
    private String uniqueName(@NonNull String prefix) {
        return prefix + " " + System.nanoTime();
    }

    @NonNull
    private String restPayload(@NonNull String name, @NonNull String endpointUrl) {
        return """
                {"name":"%s","type":"REST","endpointUrl":"%s","pollIntervalSeconds":60}
                """.formatted(name, endpointUrl);
    }

    @NonNull
    private String mqPayload(@NonNull String name) {
        return """
                {"name":"%s","type":"MQ","brokerAddress":"kafka-test.internal:9092","topic":"test.events","consumerGroup":"test-group"}
                """.formatted(name);
    }

    @NonNull
    private String createSource(@NonNull String payload) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/sources")
                        .contentType("application/json")
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
    }

    @Nested
    @DisplayName("Security tests")
    class SecurityTests {

        @Test
        @WithAnonymousUser
        @DisplayName("Anonymous user should not list sources")
        void shouldRejectAnonymousList() throws Exception {
            mockMvc.perform(get("/api/sources"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @WithAnonymousUser
        @DisplayName("Anonymous user should not create a source")
        void shouldRejectAnonymousCreate() throws Exception {
            mockMvc.perform(post("/api/sources")
                            .contentType("application/json")
                            .content(restPayload("Anon " + System.nanoTime(), "https://anon.example.com/api")))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("Get sources tests")
    class GetSourcesTests {

        @Test
        @DisplayName("Should list the seeded mock data source")
        void shouldListSeededSources() throws Exception {
            mockMvc.perform(get("/api/sources"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                    .andExpect(jsonPath("$[0].id", is("DS-MOCK-01")));
        }

        @Test
        @DisplayName("Should filter sources by free-text query")
        void shouldFilterByQuery() throws Exception {
            mockMvc.perform(get("/api/sources").param("q", "Mock"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id", is("DS-MOCK-01")))
                    .andExpect(jsonPath("$[0].type", is("REST")))
                    .andExpect(jsonPath("$[0].pollIntervalSeconds", is(5)))
                    .andExpect(jsonPath("$[0].status", is("PENDING_FIRST_SYNC")));
        }

        @Test
        @DisplayName("Should filter sources by type and status")
        void shouldFilterByTypeAndStatus() throws Exception {
            String mqId = createSource(mqPayload(uniqueName("MQ Filter")));
            String failingRestId = createSource("""
                    {"name":"%s","type":"REST","endpointUrl":"https://err.example.com/api","authType":"BEARER_TOKEN"}
                    """.formatted(uniqueName("Err Filter")));
            mockMvc.perform(post("/api/sources/" + failingRestId + "/resync"))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/api/sources").param("type", "MQ"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].id", hasItem(mqId)));

            mockMvc.perform(get("/api/sources").param("status", "ERROR"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[*].id", hasItem(failingRestId)));
        }

        @Test
        @DisplayName("Should expose broker metadata for message queue sources")
        void shouldExposeBrokerMetadataForMq() throws Exception {
            String name = uniqueName("NetFlow Filter");
            createSource(mqPayload(name));

            mockMvc.perform(get("/api/sources").param("q", name))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].brokerAddress", is("kafka-test.internal:9092")))
                    .andExpect(jsonPath("$[0].topic", is("test.events")));
        }
    }

    @Nested
    @DisplayName("Get source by id tests")
    class GetSourceByIdTests {

        @Test
        @DisplayName("Should return full configuration for seeded mock source")
        void shouldReturnDetailsWithMaskedApiKey() throws Exception {
            mockMvc.perform(get("/api/sources/DS-MOCK-01"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name", is("Mock FastAPI Source")))
                    .andExpect(jsonPath("$.endpointUrl", is("http://localhost:8001/events")))
                    .andExpect(jsonPath("$.pollIntervalSeconds", is(5)))
                    .andExpect(jsonPath("$.authType", is("API_KEY")))
                    .andExpect(jsonPath("$.authTokenMasked", is("••••-key")))
                    .andExpect(jsonPath("$.status", is("PENDING_FIRST_SYNC")));
        }

        @Test
        @DisplayName("Should return 404 for unknown source id")
        void shouldReturn404ForUnknownId() throws Exception {
            mockMvc.perform(get("/api/sources/DS-UNKNOWN"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Create source tests")
    class CreateSourceTests {

        @Test
        @DisplayName("Should create a REST source in pending first sync state")
        void shouldCreateRestSource() throws Exception {
            String name = uniqueName("Src REST");
            mockMvc.perform(post("/api/sources")
                            .contentType("application/json")
                            .content(restPayload(name, "https://new-source.example.com/api")))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id", startsWith("DS-")))
                    .andExpect(jsonPath("$.name", is(name)))
                    .andExpect(jsonPath("$.type", is("REST")))
                    .andExpect(jsonPath("$.status", is("PENDING_FIRST_SYNC")))
                    .andExpect(jsonPath("$.lastSyncStatus").value(nullValue()));
        }

        @Test
        @DisplayName("Should create a message queue source")
        void shouldCreateMqSource() throws Exception {
            String name = uniqueName("Src MQ");
            mockMvc.perform(post("/api/sources")
                            .contentType("application/json")
                            .content(mqPayload(name)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id", startsWith("DS-")))
                    .andExpect(jsonPath("$.brokerAddress", is("kafka-test.internal:9092")))
                    .andExpect(jsonPath("$.topic", is("test.events")))
                    .andExpect(jsonPath("$.consumerGroup", is("test-group")));
        }

        @Test
        @DisplayName("Should reject REST source without endpoint URL")
        void shouldRejectRestWithoutUrl() throws Exception {
            mockMvc.perform(post("/api/sources")
                            .contentType("application/json")
                            .content("""
                                    {"name":"%s","type":"REST"}
                                    """.formatted(uniqueName("Src NoUrl"))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject REST source with invalid URL scheme")
        void shouldRejectInvalidUrlScheme() throws Exception {
            mockMvc.perform(post("/api/sources")
                            .contentType("application/json")
                            .content(restPayload(uniqueName("Src Ftp"), "ftp://files.example.com/data")))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject REST source with zero poll interval")
        void shouldRejectZeroPollInterval() throws Exception {
            String name = uniqueName("Src Zero");
            mockMvc.perform(post("/api/sources")
                            .contentType("application/json")
                            .content("""
                                    {"name":"%s","type":"REST","endpointUrl":"https://ok.example.com","pollIntervalSeconds":0}
                                    """.formatted(name)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject message queue source without topic")
        void shouldRejectMqWithoutTopic() throws Exception {
            mockMvc.perform(post("/api/sources")
                            .contentType("application/json")
                            .content("""
                                    {"name":"%s","type":"MQ","brokerAddress":"kafka-test.internal:9092"}
                                    """.formatted(uniqueName("Src NoTopic"))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should reject duplicate source name with 409")
        void shouldRejectDuplicateName() throws Exception {
            String name = uniqueName("Src Dup");
            createSource(restPayload(name, "https://dup-one.example.com/api"));

            mockMvc.perform(post("/api/sources")
                            .contentType("application/json")
                            .content(restPayload(name, "https://dup-two.example.com/api")))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("Should reject create without name")
        void shouldRejectMissingName() throws Exception {
            mockMvc.perform(post("/api/sources")
                            .contentType("application/json")
                            .content("""
                                    {"type":"REST","endpointUrl":"https://noname.example.com/api"}
                                    """))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Update source tests")
    class UpdateSourceTests {

        @Test
        @DisplayName("Should replace field mappings and mask the new token")
        void shouldReplaceMappingsAndMaskToken() throws Exception {
            String id = createSource(restPayload(uniqueName("Src Upd"), "https://update.example.com/api"));

            mockMvc.perform(put("/api/sources/" + id)
                            .contentType("application/json")
                            .content("""
                                    {"authType":"BEARER_TOKEN","authToken":"super-secret-token-9876",
                                     "fieldMappings":[{"sourceField":"metric.cpu","targetField":"Thiết bị · CPU"},
                                                      {"sourceField":"metric.extra","targetField":null}]}
                                    """))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.authType", is("BEARER_TOKEN")))
                    .andExpect(jsonPath("$.authTokenMasked", is("••••9876")))
                    .andExpect(jsonPath("$.fieldMappings", hasSize(2)))
                    .andExpect(jsonPath("$.fieldMappings[1].targetField").value(nullValue()));
        }

        @Test
        @DisplayName("Should keep existing values when update fields are null")
        void shouldKeepValuesWhenNull() throws Exception {
            String id = createSource(restPayload(uniqueName("Src Keep"), "https://keep.example.com/api"));

            mockMvc.perform(put("/api/sources/" + id)
                            .contentType("application/json")
                            .content("{}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.endpointUrl", is("https://keep.example.com/api")))
                    .andExpect(jsonPath("$.pollIntervalSeconds", is(60)))
                    .andExpect(jsonPath("$.fieldMappings", hasSize(0)));
        }

        @Test
        @DisplayName("Should reject update with invalid poll interval")
        void shouldRejectInvalidIntervalOnUpdate() throws Exception {
            String id = createSource(restPayload(uniqueName("Src Bad"), "https://bad.example.com/api"));

            mockMvc.perform(put("/api/sources/" + id)
                            .contentType("application/json")
                            .content("""
                                    {"pollIntervalSeconds":-5}
                                    """))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 404 when updating unknown source")
        void shouldReturn404OnUpdate() throws Exception {
            mockMvc.perform(put("/api/sources/DS-UNKNOWN")
                            .contentType("application/json")
                            .content("{}"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Test connection tests")
    class TestConnectionTests {

        @Test
        @DisplayName("Should succeed for REST source with configured token")
        void shouldSucceedWithToken() throws Exception {
            String id = createSource("""
                    {"name":"%s","type":"REST","endpointUrl":"https://token.example.com/api",
                     "authType":"BEARER_TOKEN","authToken":"valid-token-1234"}
                    """.formatted(uniqueName("Src Tok")));

            mockMvc.perform(post("/api/sources/" + id + "/test-connection"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.message", containsString("thành công")))
                    .andExpect(jsonPath("$.latencyMs", notNullValue()));
        }

        @Test
        @DisplayName("Should fail for REST source with missing token")
        void shouldFailWithoutToken() throws Exception {
            String id = createSource("""
                    {"name":"%s","type":"REST","endpointUrl":"https://notoken.example.com/api",
                     "authType":"BEARER_TOKEN"}
                    """.formatted(uniqueName("Src NoTok")));

            mockMvc.perform(post("/api/sources/" + id + "/test-connection"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(false)))
                    .andExpect(jsonPath("$.message", containsString("Token")));
        }

        @Test
        @DisplayName("Should return 404 for unknown source")
        void shouldReturn404() throws Exception {
            mockMvc.perform(post("/api/sources/DS-UNKNOWN/test-connection"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Resync tests")
    class ResyncTests {

        @Test
        @DisplayName("Should resync a REST source from scratch and activate it")
        void shouldResyncRestSource() throws Exception {
            MvcResult result = mockMvc.perform(post("/api/sources/DS-MOCK-01/resync"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("SUCCESS")))
                    .andExpect(jsonPath("$.triggerType", is("MANUAL")))
                    .andExpect(jsonPath("$.recordsFetched", is(5)))
                    .andExpect(jsonPath("$.recordsFailed", is(0)))
                    .andExpect(jsonPath("$.finishedAt", notNullValue()))
                    .andReturn();
            String runId = JsonPath.read(result.getResponse().getContentAsString(), "$.id");

            mockMvc.perform(get("/api/sources/DS-MOCK-01"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("ACTIVE")))
                    .andExpect(jsonPath("$.lastSyncStatus", is("SUCCESS")))
                    .andExpect(jsonPath("$.retryAttempts", is(0)));

            mockMvc.perform(get("/api/sources/DS-MOCK-01/sync-history"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.page", is(0)))
                    .andExpect(jsonPath("$.size", is(10)))
                    .andExpect(jsonPath("$.totalElements", is(1)))
                    .andExpect(jsonPath("$.totalPages", is(1)))
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].id", is(runId)))
                    .andExpect(jsonPath("$.content[0].updatedAt", notNullValue()));
        }

        @Test
        @DisplayName("Should record failed resync for source with missing token")
        void shouldRecordFailedResync() throws Exception {
            String id = createSource("""
                    {"name":"%s","type":"REST","endpointUrl":"https://missing-tok.example.com/api","authType":"BEARER_TOKEN"}
                    """.formatted(uniqueName("Src Fail")));

            mockMvc.perform(post("/api/sources/" + id + "/resync"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("FAILED")))
                    .andExpect(jsonPath("$.message", containsString("Token")))
                    .andExpect(jsonPath("$.recordsFetched", is(0)));

            mockMvc.perform(get("/api/sources/" + id))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("ERROR")))
                    .andExpect(jsonPath("$.lastSyncMessage", containsString("Token")))
                    .andExpect(jsonPath("$.retryAttempts", is(1)));
        }

        @Test
        @DisplayName("Should reject resync for message queue source")
        void shouldRejectMqResync() throws Exception {
            String mqId = createSource(mqPayload(uniqueName("MQ NoResync")));
            mockMvc.perform(post("/api/sources/" + mqId + "/resync"))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 404 for unknown source")
        void shouldReturn404() throws Exception {
            mockMvc.perform(post("/api/sources/DS-UNKNOWN/resync"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Sync history tests")
    class SyncHistoryTests {

        @Test
        @DisplayName("Should return paginated sync history with latest update first")
        void shouldReturnHistoryPagedLatestUpdateFirst() throws Exception {
            Instant base = Instant.now().truncatedTo(ChronoUnit.SECONDS);
            // Older started run that finished/updated most recently must come first
            syncRecordRepository.saveAndFlush(SourceSyncRecord.builder()
                    .id("SYNC-IT-01")
                    .sourceId("DS-MOCK-01")
                    .triggerType(SyncTriggerType.MANUAL)
                    .status(SyncStatus.SUCCESS)
                    .recordsFetched(10)
                    .startedAt(base.minusSeconds(120))
                    .finishedAt(base.minusSeconds(5))
                    .updatedAt(base.minusSeconds(5))
                    .build());
            syncRecordRepository.saveAndFlush(SourceSyncRecord.builder()
                    .id("SYNC-IT-02")
                    .sourceId("DS-MOCK-01")
                    .triggerType(SyncTriggerType.SCHEDULED)
                    .status(SyncStatus.SUCCESS)
                    .recordsFetched(5)
                    .startedAt(base.minusSeconds(30))
                    .finishedAt(base.minusSeconds(30))
                    .updatedAt(base.minusSeconds(30))
                    .build());
            syncRecordRepository.saveAndFlush(SourceSyncRecord.builder()
                    .id("SYNC-IT-03")
                    .sourceId("DS-MOCK-01")
                    .triggerType(SyncTriggerType.SCHEDULED)
                    .status(SyncStatus.FAILED)
                    .message("timeout")
                    .startedAt(base.minusSeconds(60))
                    .finishedAt(base.minusSeconds(60))
                    .updatedAt(base.minusSeconds(60))
                    .build());

            mockMvc.perform(get("/api/sources/DS-MOCK-01/sync-history")
                            .param("page", "0")
                            .param("size", "2"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.page", is(0)))
                    .andExpect(jsonPath("$.size", is(2)))
                    .andExpect(jsonPath("$.totalElements", is(3)))
                    .andExpect(jsonPath("$.totalPages", is(2)))
                    .andExpect(jsonPath("$.content", hasSize(2)))
                    .andExpect(jsonPath("$.content[0].id", is("SYNC-IT-01")))
                    .andExpect(jsonPath("$.content[0].triggerType", is("MANUAL")))
                    .andExpect(jsonPath("$.content[1].id", is("SYNC-IT-02")));

            mockMvc.perform(get("/api/sources/DS-MOCK-01/sync-history")
                            .param("page", "1")
                            .param("size", "2"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.page", is(1)))
                    .andExpect(jsonPath("$.size", is(2)))
                    .andExpect(jsonPath("$.totalElements", is(3)))
                    .andExpect(jsonPath("$.totalPages", is(2)))
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].id", is("SYNC-IT-03")));

            mockMvc.perform(get("/api/sources/DS-MOCK-01/sync-history")
                            .param("page", "5")
                            .param("size", "2"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.page", is(5)))
                    .andExpect(jsonPath("$.totalElements", is(3)))
                    .andExpect(jsonPath("$.totalPages", is(2)))
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }

        @Test
        @DisplayName("Should return empty page for message queue source")
        void shouldReturnEmptyHistoryForMq() throws Exception {
            String mqId = createSource(mqPayload(uniqueName("MQ EmptyHist")));
            mockMvc.perform(get("/api/sources/" + mqId + "/sync-history"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.page", is(0)))
                    .andExpect(jsonPath("$.size", is(10)))
                    .andExpect(jsonPath("$.totalElements", is(0)))
                    .andExpect(jsonPath("$.totalPages", is(0)))
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }

        @Test
        @DisplayName("Should return 404 for unknown source")
        void shouldReturn404() throws Exception {
            mockMvc.perform(get("/api/sources/DS-UNKNOWN/sync-history"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Delete source tests")
    class DeleteSourceTests {

        @Test
        @DisplayName("Should delete a source together with its history")
        void shouldDeleteSource() throws Exception {
            String id = createSource(restPayload(uniqueName("Src Del"), "https://delete.example.com/api"));
            mockMvc.perform(post("/api/sources/" + id + "/resync"))
                    .andExpect(status().isOk());

            mockMvc.perform(delete("/api/sources/" + id))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/sources/" + id))
                    .andExpect(status().isNotFound());
            mockMvc.perform(get("/api/sources/" + id + "/sync-history"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 404 when deleting unknown source")
        void shouldReturn404OnDelete() throws Exception {
            mockMvc.perform(delete("/api/sources/DS-UNKNOWN"))
                    .andExpect(status().isNotFound());
        }
    }
}
