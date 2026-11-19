package com.gr2.noc.ai.workflow.step;

import com.gr2.noc.ai.dto.InvestigationContext;
import com.gr2.noc.ai.dto.RawInference;
import com.gr2.noc.incident.dto.get.AlarmDetails;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.rag.dto.TechnicalDocSnippet;
import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;
import com.gr2.noc.telemetry.dto.get.TelemetryTimeseriesPointDetails;
import com.gr2.noc.telemetry.enums.OperStatus;
import com.gr2.noc.topology.dto.get.LinkSummary;
import com.gr2.noc.topology.dto.get.TopologyGraph;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.ai.chat.client.ChatClient;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RagInferenceStepTest {

    private static final String INCIDENT_ID = "INC-RAGS3-1";
    private static final String DEVICE_ID = "DEV-RAGS3-1";
    private static final String LINK_ID = "LNK-RAGS3-1";

    private static final String LLM_ANSWER = """
            [
              {
                "rank": 1,
                "matchScore": 88,
                "title": "Suy hao quang tren lien ket",
                "shortTitle": "Suy hao quang",
                "targetType": "EDGE",
                "targetId": "%s",
                "confidenceRationale": "RX power thap kem canh bao OPTICS_RX_POWER_LOW",
                "cliCommand": "show interfaces optics",
                "verificationCmd": "show interfaces optics detail",
                "evidence": ["RX power -28.5 dBm"],
                "contradictingEvidence": ["Nhiet do module binh thuong"]
              }
            ]
            """.formatted(LINK_ID);

    private RagInferenceStep step;
    private ChatClient.ChatClientRequestSpec requestSpec;
    private ChatClient.CallResponseSpec callResponseSpec;

    @BeforeEach
    void setUp() {
        ChatClient.Builder builder = mock(ChatClient.Builder.class);
        ChatClient chatClient = mock(ChatClient.class);
        requestSpec = mock(ChatClient.ChatClientRequestSpec.class);
        callResponseSpec = mock(ChatClient.CallResponseSpec.class);
        when(builder.build()).thenReturn(chatClient);
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.system(anyString())).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callResponseSpec);
        when(callResponseSpec.content()).thenReturn(LLM_ANSWER);
        step = new RagInferenceStep(builder);
    }

    @Test
    void shouldReturnRawInferenceWithEngineAndRunbookTitles() {
        InvestigationContext context = fullContext();

        RawInference raw = step.infer(context);

        assertEquals(LLM_ANSWER, raw.rawContent());
        assertEquals("rag", raw.engineType());
        assertSame(context, raw.context());
        assertEquals(List.of("Quy trình xử lý suy hao quang", "Quy trình chẩn đoán BGP Flapping"),
                raw.consultedRunbooks());
    }

    @Test
    void shouldIncludeAllContextSectionsInPrompts() {
        step.infer(fullContext());

        ArgumentCaptor<String> systemCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> userCaptor = ArgumentCaptor.forClass(String.class);
        verify(requestSpec).system(systemCaptor.capture());
        verify(requestSpec).user(userCaptor.capture());

        String systemPrompt = systemCaptor.getValue();
        assertTrue(systemPrompt.contains("KHÔNG ẢO GIÁC"));
        assertTrue(systemPrompt.contains("matchScore"));

        String userPrompt = userCaptor.getValue();
        assertTrue(userPrompt.contains("Mã sự cố: " + INCIDENT_ID));
        assertTrue(userPrompt.contains("Optical loss at core"));
        assertTrue(userPrompt.contains("OPTICS_RX_POWER_LOW"));
        assertTrue(userPrompt.contains("BGP_FLAP"));
        assertTrue(userPrompt.contains("DEGRADED"));
        assertTrue(userPrompt.contains("Xu hướng CPU 1 giờ qua: tăng mạnh từ 45.0% lên 78.5%"));
        assertTrue(userPrompt.contains("LINK " + LINK_ID));
        assertTrue(userPrompt.contains("RX -28.5 dBm"));
        assertTrue(userPrompt.contains("Quy trình xử lý suy hao quang"));
        assertTrue(userPrompt.contains("Dùng OTDR đo hai đầu tuyến."));
        assertTrue(userPrompt.contains("\"rank\": 1"));
    }

    @Test
    void shouldNoteMissingDataInPrompt() {
        InvestigationContext context = InvestigationContext.builder()
                .incident(IncidentDetails.builder()
                        .id(INCIDENT_ID)
                        .title("Incident without evidence")
                        .openedAt(Instant.parse("2026-11-17T10:00:00Z"))
                        .build())
                .build();

        step.infer(context);

        ArgumentCaptor<String> userCaptor = ArgumentCaptor.forClass(String.class);
        verify(requestSpec).user(userCaptor.capture());
        assertTrue(userCaptor.getValue().contains("(không có cảnh báo)"));
        assertTrue(userCaptor.getValue().contains("(không có dữ liệu telemetry gần nhất)"));
        assertTrue(userCaptor.getValue().contains("(không có SOP nào khớp bối cảnh này)"));
    }

    @Test
    void shouldPropagateLlmFailure() {
        when(callResponseSpec.content()).thenThrow(new RuntimeException("api down"));

        assertThrows(RuntimeException.class, () -> step.infer(fullContext()));
    }

    private InvestigationContext fullContext() {
        return InvestigationContext.builder()
                .incident(IncidentDetails.builder()
                        .id(INCIDENT_ID)
                        .title("Optical loss at core")
                        .severity(Severity.CRITICAL)
                        .primaryDeviceId(DEVICE_ID)
                        .openedAt(Instant.parse("2026-11-17T10:00:00Z"))
                        .build())
                .alarms(List.of(
                        AlarmDetails.builder()
                                .id("ALM-1")
                                .incidentId(INCIDENT_ID)
                                .deviceId(DEVICE_ID)
                                .timestamp(Instant.parse("2026-11-17T09:55:00Z"))
                                .faultCode("OPTICS_RX_POWER_LOW")
                                .message("Công suất RX xuống thấp")
                                .build(),
                        AlarmDetails.builder()
                                .id("ALM-2")
                                .incidentId(INCIDENT_ID)
                                .deviceId(DEVICE_ID)
                                .timestamp(Instant.parse("2026-11-17T09:56:00Z"))
                                .faultCode("BGP_FLAP")
                                .message("BGP neighbor flapping")
                                .build()))
                .telemetrySnapshot(DeviceTelemetrySnapshotDetails.builder()
                        .deviceId(DEVICE_ID)
                        .operStatus(OperStatus.DEGRADED)
                        .cpuPercent(78.5)
                        .memoryPercent(61.0)
                        .temperatureCelsius(52.0)
                        .loadPercentage(34.0)
                        .routesLearned(1200)
                        .routesUsed(1180)
                        .build())
                .cpuTimeseries(TelemetryMetricSeries.builder()
                        .deviceId(DEVICE_ID)
                        .metricName("CPU")
                        .unit("%")
                        .points(List.of(
                                point(Instant.parse("2026-11-17T09:05:00Z"), 45.0),
                                point(Instant.parse("2026-11-17T10:00:00Z"), 78.5)))
                        .build())
                .epicenterTopology(TopologyGraph.of(
                        List.of(),
                        List.of(LinkSummary.builder()
                                .linkId(LINK_ID)
                                .sourceDeviceId(DEVICE_ID)
                                .targetDeviceId("DEV-RAGS3-2")
                                .operStatus("DEGRADED")
                                .capacityGbps(10)
                                .rxPowerDbm(-28.5)
                                .txPowerDbm(-2.1)
                                .utilizationPercent(41.0)
                                .build())))
                .runbooks(List.of(
                        TechnicalDocSnippet.builder()
                                .documentId("SOP-OPTICS-01")
                                .title("Quy trình xử lý suy hao quang")
                                .chunkIndex(0)
                                .content("Dùng OTDR đo hai đầu tuyến.")
                                .similarityScore(0.91)
                                .build(),
                        TechnicalDocSnippet.builder()
                                .documentId("SOP-BGP-01")
                                .title("Quy trình chẩn đoán BGP Flapping")
                                .chunkIndex(0)
                                .content("Kiểm tra log BGP NOTIFICATION.")
                                .similarityScore(0.83)
                                .build()))
                .build();
    }

    private TelemetryTimeseriesPointDetails point(Instant timestamp, double value) {
        return TelemetryTimeseriesPointDetails.builder()
                .timestamp(timestamp)
                .value(value)
                .unit("%")
                .build();
    }
}
