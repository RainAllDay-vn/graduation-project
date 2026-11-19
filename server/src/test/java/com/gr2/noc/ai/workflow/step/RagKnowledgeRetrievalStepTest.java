package com.gr2.noc.ai.workflow.step;

import com.gr2.noc.ai.dto.InvestigationContext;
import com.gr2.noc.incident.dto.get.AlarmDetails;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.rag.dto.TechnicalDocSnippet;
import com.gr2.noc.rag.service.TechnicalDocVectorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class RagKnowledgeRetrievalStepTest {

    private static final String INCIDENT_ID = "INC-RAGS2-1";
    private static final String DEVICE_ID = "DEV-RAGS2-1";

    private TechnicalDocVectorService technicalDocVectorService;
    private RagKnowledgeRetrievalStep step;

    @BeforeEach
    void setUp() {
        technicalDocVectorService = mock(TechnicalDocVectorService.class);
        step = new RagKnowledgeRetrievalStep(technicalDocVectorService);
        ReflectionTestUtils.setField(step, "topK", 3);
        ReflectionTestUtils.setField(step, "minSimilarityScore", 0.70);
    }

    @Test
    void shouldQueryVectorStoreWithIncidentTitleAndFaultCodes() {
        when(technicalDocVectorService.searchRelevantSnippets(anyString(), anyInt(), anyDouble()))
                .thenReturn(List.of());

        step.retrieve(context(List.of(
                alarm("OPTICS_RX_POWER_LOW"),
                alarm("BGP_FLAP"))));

        ArgumentCaptor<String> queryCaptor = ArgumentCaptor.forClass(String.class);
        verify(technicalDocVectorService).searchRelevantSnippets(queryCaptor.capture(), eq(3), eq(0.70));
        String query = queryCaptor.getValue();
        assertTrue(query.contains("Optical loss at core"));
        assertTrue(query.contains("OPTICS_RX_POWER_LOW"));
        assertTrue(query.contains("BGP_FLAP"));
    }

    @Test
    void shouldApplyRetrievedRunbooksToContext() {
        List<TechnicalDocSnippet> snippets = List.of(
                TechnicalDocSnippet.builder()
                        .documentId("SOP-OPTICS-01")
                        .title("Quy trình xử lý suy hao quang")
                        .chunkIndex(0)
                        .content("Dùng OTDR đo hai đầu tuyến.")
                        .similarityScore(0.91)
                        .build());
        when(technicalDocVectorService.searchRelevantSnippets(contains("OPTICS_RX_POWER_LOW"), eq(3), eq(0.70)))
                .thenReturn(snippets);

        InvestigationContext result = step.retrieve(context(List.of(alarm("OPTICS_RX_POWER_LOW"))));

        assertSame(snippets, result.runbooks());
    }

    @Test
    void shouldSearchWithTitleOnlyWhenNoAlarms() {
        when(technicalDocVectorService.searchRelevantSnippets(anyString(), anyInt(), anyDouble()))
                .thenReturn(List.of());

        step.retrieve(context(List.of()));

        ArgumentCaptor<String> queryCaptor = ArgumentCaptor.forClass(String.class);
        verify(technicalDocVectorService).searchRelevantSnippets(queryCaptor.capture(), eq(3), eq(0.70));
        assertEquals("Optical loss at core", queryCaptor.getValue());
    }

    @Test
    void shouldReturnContextUnchangedWhenIncidentMissing() {
        InvestigationContext context = InvestigationContext.builder().build();

        InvestigationContext result = step.retrieve(context);

        assertSame(context, result);
        verifyNoInteractions(technicalDocVectorService);
    }

    private InvestigationContext context(List<AlarmDetails> alarms) {
        return InvestigationContext.builder()
                .incident(IncidentDetails.builder()
                        .id(INCIDENT_ID)
                        .title("Optical loss at core")
                        .severity(Severity.CRITICAL)
                        .primaryDeviceId(DEVICE_ID)
                        .openedAt(Instant.parse("2026-11-17T10:00:00Z"))
                        .build())
                .alarms(alarms)
                .build();
    }

    private AlarmDetails alarm(String faultCode) {
        return AlarmDetails.builder()
                .id("ALM-" + faultCode)
                .incidentId(INCIDENT_ID)
                .deviceId(DEVICE_ID)
                .timestamp(Instant.parse("2026-11-17T09:55:00Z"))
                .faultCode(faultCode)
                .message("Cảnh báo " + faultCode)
                .build();
    }
}
