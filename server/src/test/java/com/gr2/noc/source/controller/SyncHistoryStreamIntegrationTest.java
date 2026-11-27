package com.gr2.noc.source.controller;

import com.gr2.noc.source.service.SyncHistoryStreamService;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@WithMockUser
class SyncHistoryStreamIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SyncHistoryStreamService syncHistoryStreamService;

    @Test
    @DisplayName("Should push sync-record SSE event after transaction commit on resync")
    void shouldPushSyncRecordEventAfterCommit() throws Exception {
        String sourceName = "Stream Test " + System.nanoTime();
        MvcResult createResult = mockMvc.perform(post("/api/sources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","type":"REST","endpointUrl":"https://stream.example.com/events","pollIntervalSeconds":60}
                                """.formatted(sourceName)))
                .andExpect(status().isCreated())
                .andReturn();
        String sourceId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");

        try {
            MvcResult streamResult = mockMvc.perform(get("/api/sources/" + sourceId + "/sync-history/stream"))
                    .andExpect(request().asyncStarted())
                    .andReturn();

            MvcResult resyncResult = mockMvc.perform(post("/api/sources/" + sourceId + "/resync"))
                    .andExpect(status().isOk())
                    .andReturn();
            String runId = JsonPath.read(resyncResult.getResponse().getContentAsString(), "$.id");

            syncHistoryStreamService.closeEmitters(sourceId);

            mockMvc.perform(asyncDispatch(streamResult))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM))
                    .andExpect(content().string(containsString("event:connected")))
                    .andExpect(content().string(containsString("event:sync-record")))
                    .andExpect(content().string(containsString(runId)))
                    .andExpect(content().string(containsString("\"sourceStatus\":\"ACTIVE\"")));
        } finally {
            mockMvc.perform(delete("/api/sources/" + sourceId))
                    .andExpect(status().isNoContent());
        }
    }
}
