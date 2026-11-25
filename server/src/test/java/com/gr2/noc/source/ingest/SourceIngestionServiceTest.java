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
import com.gr2.noc.telemetry.dto.create.RecordDeviceTelemetrySnapshotRequest;
import com.gr2.noc.telemetry.dto.create.RecordTelemetryPointRequest;
import com.gr2.noc.telemetry.enums.OperStatus;
import com.gr2.noc.telemetry.service.TelemetryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SourceIngestionServiceTest {

    private TelemetryService telemetryService;
    private IncidentService incidentService;
    private IncidentRepository incidentRepository;
    private AlarmRepository alarmRepository;
    private SourceIngestionService ingestionService;

    @BeforeEach
    void setUp() {
        telemetryService = mock(TelemetryService.class);
        incidentService = mock(IncidentService.class);
        incidentRepository = mock(IncidentRepository.class);
        alarmRepository = mock(AlarmRepository.class);
        ingestionService = new SourceIngestionService(
                telemetryService, incidentService, incidentRepository, alarmRepository, new ObjectMapper());
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
}
