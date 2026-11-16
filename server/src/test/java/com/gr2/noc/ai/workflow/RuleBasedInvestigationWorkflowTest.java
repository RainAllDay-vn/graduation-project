package com.gr2.noc.ai.workflow;

import com.gr2.noc.ai.dto.InvestigationResult;
import com.gr2.noc.ai.workflow.step.ContextGatheringStepImpl;
import com.gr2.noc.ai.workflow.step.HypothesisSynthesisStepImpl;
import com.gr2.noc.ai.workflow.step.InferenceStep;
import com.gr2.noc.ai.workflow.step.KnowledgeRetrievalStep;
import com.gr2.noc.ai.workflow.step.RuleBasedInferenceStep;
import com.gr2.noc.ai.workflow.step.RuleBasedKnowledgeRetrievalStep;
import com.gr2.noc.document.enums.IndexingStatus;
import com.gr2.noc.document.model.TechnicalDocument;
import com.gr2.noc.document.repository.TechnicalDocumentRepository;
import com.gr2.noc.hypothesis.dto.create.CreateHypothesisRequest;
import com.gr2.noc.hypothesis.dto.get.HypothesisDetails;
import com.gr2.noc.hypothesis.service.HypothesisService;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Alarm;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.IncidentRepository;
import com.gr2.noc.incident.service.IncidentService;
import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;
import com.gr2.noc.telemetry.enums.OperStatus;
import com.gr2.noc.telemetry.service.TelemetryService;
import com.gr2.noc.topology.dto.get.DeviceSummary;
import com.gr2.noc.topology.dto.get.LinkSummary;
import com.gr2.noc.topology.dto.get.TopologyGraph;
import com.gr2.noc.topology.service.TopologyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RuleBasedInvestigationWorkflowTest {

    private static final String INCIDENT_ID = "INC-RB-1";
    private static final String DEVICE_ID = "DEV-RB-1";
    private static final String LINK_ID = "LNK-RB-1";

    private IncidentService incidentService;
    private IncidentRepository incidentRepository;
    private TelemetryService telemetryService;
    private TopologyService topologyService;
    private TechnicalDocumentRepository documentRepository;
    private HypothesisService hypothesisService;
    private RuleBasedInvestigationWorkflow workflow;

    @BeforeEach
    void setUp() {
        incidentService = mock(IncidentService.class);
        incidentRepository = mock(IncidentRepository.class);
        telemetryService = mock(TelemetryService.class);
        topologyService = mock(TopologyService.class);
        documentRepository = mock(TechnicalDocumentRepository.class);
        hypothesisService = mock(HypothesisService.class);

        ContextGatheringStepImpl gathering = new ContextGatheringStepImpl(
                incidentService, incidentRepository, telemetryService, topologyService);
        KnowledgeRetrievalStep retrieval = new RuleBasedKnowledgeRetrievalStep(documentRepository);
        InferenceStep inference = new RuleBasedInferenceStep();

        workflow = new RuleBasedInvestigationWorkflow(
                gathering, retrieval, inference, new HypothesisSynthesisStepImpl(), hypothesisService);
    }

    @Test
    void shouldProduceRankedHypothesesFromDeterministicRules() {
        Instant openedAt = Instant.now();
        IncidentDetails incident = IncidentDetails.builder()
                .id(INCIDENT_ID)
                .title("Optical loss at core")
                .status(IncidentStatus.INVESTIGATING)
                .severity(Severity.CRITICAL)
                .primaryDeviceId(DEVICE_ID)
                .openedAt(openedAt)
                .alarmCount(1)
                .build();
        Alarm alarm = Alarm.builder()
                .id("ALM-1")
                .deviceId(DEVICE_ID)
                .timestamp(openedAt)
                .severity(Severity.CRITICAL)
                .faultCode("OPTICS_RX_POWER_LOW")
                .message("RX power below threshold on Te0/1")
                .build();
        Incident incidentEntity = Incident.builder()
                .id(INCIDENT_ID)
                .alarms(List.of(alarm))
                .build();

        DeviceTelemetrySnapshotDetails snapshot = DeviceTelemetrySnapshotDetails.builder()
                .deviceId(DEVICE_ID)
                .operStatus(OperStatus.UP)
                .cpuPercent(45.0)
                .temperatureCelsius(72.0)
                .build();
        LinkSummary degradedLink = LinkSummary.builder()
                .linkId(LINK_ID)
                .sourceDeviceId(DEVICE_ID)
                .targetDeviceId("DEV-RB-2")
                .sourcePort("Te0/1")
                .targetPort("Te0/2")
                .operStatus("DOWN")
                .rxPowerDbm(-32.5)
                .build();
        TopologyGraph graph = TopologyGraph.of(
                List.of(
                        DeviceSummary.builder().id(DEVICE_ID).name("Core 1").build(),
                        DeviceSummary.builder().id("DEV-RB-2").name("Agg 1").build()
                ),
                List.of(degradedLink));
        TechnicalDocument runbook = TechnicalDocument.builder()
                .id("SOP-OPTICS-01")
                .title("Quy trình xử lý sự cố cáp quang và mất tín hiệu RX")
                .content("suy hao quang RX")
                .targetFaultCodes(Set.of("OPTICS_RX_POWER_LOW"))
                .build();

        when(incidentService.getIncidentById(INCIDENT_ID)).thenReturn(incident);
        when(incidentRepository.findById(INCIDENT_ID)).thenReturn(Optional.of(incidentEntity));
        when(telemetryService.getLatestSnapshot(DEVICE_ID)).thenReturn(snapshot);
        when(telemetryService.getMetricTimeseries(anyString(), anyString(), any(), any()))
                .thenReturn(TelemetryMetricSeries.builder()
                        .deviceId(DEVICE_ID).metricName("CPU").points(List.of()).build());
        when(topologyService.getSubgraph(DEVICE_ID, null, 1)).thenReturn(graph);
        when(documentRepository.findByIndexingStatusOrderByCreatedAtDesc(IndexingStatus.READY))
                .thenReturn(List.of(runbook));
        when(hypothesisService.createHypothesis(anyString(), any())).thenAnswer(invocation -> {
            CreateHypothesisRequest request = invocation.getArgument(1);
            return HypothesisDetails.builder()
                    .id(1L)
                    .incidentId(INCIDENT_ID)
                    .rank(request.rank())
                    .matchScore(request.matchScore())
                    .title(request.title())
                    .shortTitle(request.shortTitle())
                    .targetType(request.targetType())
                    .targetId(request.targetId())
                    .sourcePort(request.sourcePort())
                    .targetPort(request.targetPort())
                    .evidence(request.evidence())
                    .contradictingEvidence(request.contradictingEvidence())
                    .build();
        });

        InvestigationResult result = workflow.execute(INCIDENT_ID);

        assertEquals(INCIDENT_ID, result.incidentId());
        assertEquals("rule-based", result.engineType());
        assertEquals(List.of("Quy trình xử lý sự cố cáp quang và mất tín hiệu RX"), result.consultedRunbooks());
        assertEquals(2, result.hypotheses().size());

        HypothesisDetails first = result.hypotheses().get(0);
        assertEquals(1, first.rank());
        assertEquals(90, first.matchScore());
        assertEquals("EDGE", first.targetType());
        assertEquals(LINK_ID, first.targetId());
        assertEquals("Te0/1", first.sourcePort());
        assertTrue(first.evidence().size() >= 2);

        HypothesisDetails second = result.hypotheses().get(1);
        assertEquals(2, second.rank());
        assertEquals(78, second.matchScore());
        assertEquals("NODE", second.targetType());
        assertEquals(DEVICE_ID, second.targetId());
        assertTrue(second.evidence().stream().anyMatch(item -> item.contains("72.0")));
    }
}
