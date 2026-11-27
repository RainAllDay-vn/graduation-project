package com.gr2.noc.source.ingest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.incident.dto.create.CreateIncidentRequest;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Alarm;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.AlarmRepository;
import com.gr2.noc.incident.repository.IncidentRepository;
import com.gr2.noc.incident.service.IncidentService;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.service.NetworkServiceService;
import com.gr2.noc.telemetry.dto.create.RecordDeviceTelemetrySnapshotRequest;
import com.gr2.noc.telemetry.dto.create.RecordTelemetryPointRequest;
import com.gr2.noc.telemetry.enums.OperStatus;
import com.gr2.noc.telemetry.service.TelemetryService;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.service.TopologyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SourceIngestionServiceTest {

    private TelemetryService telemetryService;
    private IncidentService incidentService;
    private IncidentRepository incidentRepository;
    private AlarmRepository alarmRepository;
    private TopologyService topologyService;
    private NetworkServiceService networkServiceService;
    private SourceIngestionService ingestionService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        telemetryService = mock(TelemetryService.class);
        incidentService = mock(IncidentService.class);
        incidentRepository = mock(IncidentRepository.class);
        alarmRepository = mock(AlarmRepository.class);
        topologyService = mock(TopologyService.class);
        networkServiceService = mock(NetworkServiceService.class);
        ingestionService = new SourceIngestionService(
                telemetryService,
                incidentService,
                incidentRepository,
                alarmRepository,
                topologyService,
                networkServiceService,
                objectMapper
        );
    }

    @Test
    void shouldIngestTelemetrySnapshot() {
        String raw = """
                {
                  "type": "telemetry.snapshot",
                  "occurredAt": "2026-11-17T10:00:00Z",
                  "payload": {
                    "deviceId": "DEV-MQ-1",
                    "operStatus": "DEGRADED",
                    "cpuPercent": 91.5,
                    "temperatureCelsius": 71.0
                  }
                }
                """;

        IngestResult result = ingestionService.ingest(raw);

        assertTrue(result.success());
        assertEquals(1, result.recordsIngested());
        ArgumentCaptor<RecordDeviceTelemetrySnapshotRequest> captor =
                ArgumentCaptor.forClass(RecordDeviceTelemetrySnapshotRequest.class);
        verify(telemetryService).recordSnapshot(eq("DEV-MQ-1"), captor.capture());
        assertEquals(OperStatus.DEGRADED, captor.getValue().operStatus());
        assertEquals(91.5, captor.getValue().cpuPercent());
        assertEquals(71.0, captor.getValue().temperatureCelsius());
    }

    @Test
    void shouldIngestTimeseriesPointsAndSkipInvalidOnes() {
        String raw = """
                {
                  "type": "telemetry.points",
                  "payload": {
                    "deviceId": "DEV-MQ-1",
                    "metricName": "CPU",
                    "unit": "%",
                    "points": [
                      {"timestamp": "2026-11-17T10:00:00Z", "value": 42.0},
                      {"timestamp": "2026-11-17T10:01:00Z"},
                      {"timestamp": 1763373600000, "value": 44.5}
                    ]
                  }
                }
                """;
        when(telemetryService.recordTimeseriesPoints(anyString(), any())).thenAnswer(invocation ->
                ((List<?>) invocation.getArgument(1)).size());

        IngestResult result = ingestionService.ingest(raw);

        assertTrue(result.success());
        assertEquals(2, result.recordsIngested());
        assertEquals(1, result.recordsFailed());
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<RecordTelemetryPointRequest>> captor = ArgumentCaptor.forClass(List.class);
        verify(telemetryService).recordTimeseriesPoints(eq("DEV-MQ-1"), captor.capture());
        assertEquals("CPU", captor.getValue().get(0).metricName());
        assertEquals("%", captor.getValue().get(0).unit());
        assertEquals(44.5, captor.getValue().get(1).value());
    }

    @Test
    void shouldAttachAlarmToOpenIncident() {
        String raw = """
                {
                  "type": "alarm",
                  "payload": {
                    "deviceId": "DEV-MQ-1",
                    "faultCode": "BGP_FLAP",
                    "severity": "CRITICAL",
                    "message": "BGP session flapping"
                  }
                }
                """;
        Incident openIncident = Incident.builder()
                .id("INC-1")
                .status(IncidentStatus.INVESTIGATING)
                .build();
        when(incidentRepository.findByPrimaryDeviceIdOrderByCreatedAtDesc("DEV-MQ-1"))
                .thenReturn(List.of(openIncident));

        IngestResult result = ingestionService.ingest(raw);

        assertTrue(result.success());
        ArgumentCaptor<Alarm> captor = ArgumentCaptor.forClass(Alarm.class);
        verify(alarmRepository).save(captor.capture());
        assertEquals(openIncident, captor.getValue().getIncident());
        assertEquals("BGP_FLAP", captor.getValue().getFaultCode());
        assertEquals(Severity.CRITICAL, captor.getValue().getSeverity());
        assertTrue(captor.getValue().isCurrentIncident());
        verify(incidentService, never()).createIncident(any());
    }

    @Test
    void shouldCreateIncidentWhenNoOpenIncidentExists() {
        String raw = """
                {
                  "type": "alarm",
                  "payload": {
                    "deviceId": "DEV-MQ-2",
                    "faultCode": "OPTICS_TEMP_HIGH"
                  }
                }
                """;
        when(incidentRepository.findByPrimaryDeviceIdOrderByCreatedAtDesc("DEV-MQ-2"))
                .thenReturn(List.of());
        Incident created = Incident.builder()
                .id("INC-MQ-1")
                .status(IncidentStatus.OPEN)
                .build();
        when(incidentService.createIncident(any())).thenReturn(IncidentDetails.builder()
                .id("INC-MQ-1")
                .status(IncidentStatus.OPEN)
                .build());
        when(incidentRepository.findById("INC-MQ-1")).thenReturn(Optional.of(created));

        IngestResult result = ingestionService.ingest(raw);

        assertTrue(result.success());
        ArgumentCaptor<CreateIncidentRequest> captor = ArgumentCaptor.forClass(CreateIncidentRequest.class);
        verify(incidentService).createIncident(captor.capture());
        assertTrue(captor.getValue().title().contains("OPTICS_TEMP_HIGH"));
        assertTrue(captor.getValue().title().contains("DEV-MQ-2"));
        assertEquals(IncidentStatus.OPEN, captor.getValue().status());
        assertEquals(Severity.WARNING, captor.getValue().severity());
        verify(alarmRepository).save(any(Alarm.class));
    }

    @Test
    void shouldIngestParsedJsonNode() throws Exception {
        com.fasterxml.jackson.databind.JsonNode root = new ObjectMapper().readTree("""
                {"type":"telemetry.snapshot","payload":{"deviceId":"DEV-NODE-1","operStatus":"UP"}}
                """);

        IngestResult result = ingestionService.ingest(root);

        assertTrue(result.success());
        assertEquals(1, result.recordsIngested());
        verify(telemetryService).recordSnapshot(eq("DEV-NODE-1"), any());
    }

    @Test
    void shouldFailOnUnknownType() {
        IngestResult result = ingestionService.ingest("{\"type\":\"topology.link\",\"payload\":{}}");

        assertFalse(result.success());
        assertTrue(result.message().contains("Loại thông điệp không hỗ trợ"));
    }

    @Test
    void shouldFailOnMalformedJson() {
        IngestResult result = ingestionService.ingest("{not json");

        assertFalse(result.success());
        assertTrue(result.message().contains("Lỗi xử lý thông điệp"));
    }

    @Test
    void shouldFailOnMissingPayload() {
        IngestResult result = ingestionService.ingest("{\"type\":\"alarm\"}");

        assertFalse(result.success());
        assertTrue(result.message().contains("payload"));
    }

    @Test
    void shouldFailOnMissingRequiredField() {
        String raw = "{\"type\":\"telemetry.snapshot\",\"payload\":{\"operStatus\":\"UP\"}}";

        IngestResult result = ingestionService.ingest(raw);

        assertFalse(result.success());
        assertTrue(result.message().contains("deviceId"));
    }

    @Test
    void shouldFailOnBlankMessage() {
        IngestResult result = ingestionService.ingest("   ");

        assertFalse(result.success());
        assertTrue(result.message().contains("rỗng"));
    }

    @Test
    void shouldFailOnInvalidOperStatus() {
        String raw = """
                {"type":"telemetry.snapshot","payload":{"deviceId":"DEV-MQ-1","operStatus":"WARPED"}}
                """;

        IngestResult result = ingestionService.ingest(raw);

        assertFalse(result.success());
        assertTrue(result.message().contains("operStatus"));
    }

    @Test
    void shouldDispatchNodeLinkAndServiceHandlers() {
        assertTrue(ingestionService.ingest("""
                {"type":"node.discovered","payload":{"id":"EDGE-1","name":"Edge 1","layer":"AGGREGATION"}}
                """).success());
        verify(topologyService).upsertDevice(
                argThat(arg -> "EDGE-1".equals(arg.id()) && arg.layer() == DeviceLayer.AGGREGATION));

        assertTrue(ingestionService.ingest("""
                {"type":"node.status","payload":{"id":"EDGE-1","status":"DEGRADED","accessErrorCount":2}}
                """).success());
        verify(topologyService).updateDeviceStatus(eq("EDGE-1"),
                argThat(arg -> arg.status() == DeviceStatus.DEGRADED
                        && Integer.valueOf(2).equals(arg.accessErrorCount())));

        assertTrue(ingestionService.ingest("""
                {"type":"link.discovered","payload":{
                  "linkId":"LNK-1","sourceDeviceId":"EDGE-1","targetDeviceId":"CORE-01",
                  "sourcePort":"et-0/0/1","targetPort":"et-0/0/2"
                }}
                """).success());
        verify(topologyService).upsertLink(argThat(arg -> "LNK-1".equals(arg.linkId())));

        assertTrue(ingestionService.ingest("""
                {"type":"link.status","payload":{"linkId":"LNK-1","operStatus":"DOWN"}}
                """).success());
        verify(topologyService).updateLinkStatus(eq("LNK-1"), argThat(arg -> "DOWN".equals(arg.operStatus())));

        assertTrue(ingestionService.ingest("""
                {"type":"service.discovered","payload":{
                  "id":"SVC-1","name":"Transit","type":"INTERNET_TRANSIT","dependentDeviceIds":["EDGE-1"]
                }}
                """).success());
        verify(networkServiceService).upsertService(argThat(arg -> "SVC-1".equals(arg.id())));

        assertTrue(ingestionService.ingest("""
                {"type":"service.status","payload":{"id":"SVC-1","status":"OUTAGE"}}
                """).success());
        verify(networkServiceService).updateServiceStatus("SVC-1", ServiceStatus.OUTAGE);

        assertTrue(ingestionService.ingest("""
                {"type":"service.dependency","payload":{"id":"SVC-1","dependentDeviceIds":["CORE-01"]}}
                """).success());
        verify(networkServiceService).syncDependencies("SVC-1", List.of("CORE-01"));

        assertTrue(ingestionService.ingest("""
                {"type":"link.removed","payload":{"linkId":"LNK-1","hardDelete":true}}
                """).success());
        verify(topologyService).removeLink("LNK-1", true);

        assertTrue(ingestionService.ingest("""
                {"type":"node.removed","payload":{"id":"EDGE-1"}}
                """).success());
        verify(topologyService).removeDevice("EDGE-1", false);
    }

    @Test
    void shouldOrderBatchDependenciesBeforeExecution() throws Exception {
        com.fasterxml.jackson.databind.JsonNode array = objectMapper.readTree("""
                [
                  {"type":"node.removed","payload":{"id":"OLD-1"}},
                  {"type":"link.removed","payload":{"linkId":"OLD-LNK"}},
                  {"type":"telemetry.snapshot","payload":{"deviceId":"EDGE-1","operStatus":"UP"}},
                  {"type":"service.status","payload":{"id":"SVC-1","status":"OPERATIONAL"}},
                  {"type":"link.discovered","payload":{
                    "linkId":"LNK-1","sourceDeviceId":"EDGE-1","targetDeviceId":"CORE-01",
                    "sourcePort":"p1","targetPort":"p2"
                  }},
                  {"type":"service.discovered","payload":{"id":"SVC-1","name":"Svc","type":"VOIP"}},
                  {"type":"node.discovered","payload":{"id":"EDGE-1","name":"Edge 1","layer":"ACCESS"}}
                ]
                """);
        List<com.fasterxml.jackson.databind.JsonNode> batch = new java.util.ArrayList<>();
        array.forEach(batch::add);

        List<IngestResult> results = ingestionService.ingestBatch(batch);

        assertEquals(7, results.size());
        assertTrue(results.stream().allMatch(IngestResult::success));

        InOrder order = inOrder(topologyService, networkServiceService, telemetryService);
        order.verify(topologyService).upsertDevice(any());
        order.verify(topologyService).upsertLink(any());
        order.verify(networkServiceService).upsertService(any());
        order.verify(networkServiceService).updateServiceStatus("SVC-1", ServiceStatus.OPERATIONAL);
        order.verify(telemetryService).recordSnapshot(eq("EDGE-1"), any());
        order.verify(topologyService).removeLink("OLD-LNK", false);
        order.verify(topologyService).removeDevice("OLD-1", false);
    }
}
