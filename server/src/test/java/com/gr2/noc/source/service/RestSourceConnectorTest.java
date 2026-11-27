package com.gr2.noc.source.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.AlarmRepository;
import com.gr2.noc.incident.repository.IncidentRepository;
import com.gr2.noc.incident.service.IncidentService;
import com.gr2.noc.service.service.NetworkServiceService;
import com.gr2.noc.source.enums.SourceAuthType;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.ingest.SourceIngestionService;
import com.gr2.noc.source.model.ExternalSource;
import com.gr2.noc.telemetry.service.TelemetryService;
import com.gr2.noc.topology.service.TopologyService;
import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RestSourceConnectorTest {

    private static final String SNAPSHOT_MESSAGE = """
            {
              "type": "telemetry.snapshot",
              "payload": {"deviceId": "DEV-RST-1", "operStatus": "UP", "cpuPercent": 42.0}
            }
            """;
    private static final String ALARM_MESSAGE = """
            {
              "type": "alarm",
              "payload": {"deviceId": "DEV-RST-1", "faultCode": "LINK_DOWN", "severity": "MAJOR"}
            }
            """;

    private TelemetryService telemetryService;
    private IncidentService incidentService;
    private IncidentRepository incidentRepository;
    private AlarmRepository alarmRepository;
    private RestSourceConnector connector;
    private HttpServer server;
    private final AtomicReference<URI> lastRequestUri = new AtomicReference<>();
    private final AtomicReference<Headers> lastRequestHeaders = new AtomicReference<>();
    private final AtomicReference<String> lastRequestProtocol = new AtomicReference<>();
    private volatile String responseBody = "[]";
    private volatile int responseStatus = 200;

    @BeforeEach
    void setUp() throws IOException {
        telemetryService = mock(TelemetryService.class);
        incidentService = mock(IncidentService.class);
        incidentRepository = mock(IncidentRepository.class);
        alarmRepository = mock(AlarmRepository.class);
        ObjectMapper objectMapper = new ObjectMapper();
        SourceIngestionService ingestionService = new SourceIngestionService(
                telemetryService,
                incidentService,
                incidentRepository,
                alarmRepository,
                mock(TopologyService.class),
                mock(NetworkServiceService.class),
                objectMapper
        );
        connector = new RestSourceConnector(2, objectMapper, ingestionService);

        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/", exchange -> {
            lastRequestUri.set(exchange.getRequestURI());
            Headers headers = new Headers();
            headers.putAll(exchange.getRequestHeaders());
            lastRequestHeaders.set(headers);
            lastRequestProtocol.set(exchange.getProtocol());
            byte[] body = responseBody.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(responseStatus, body.length == 0 ? -1 : body.length);
            if (body.length > 0) {
                exchange.getResponseBody().write(body);
            }
            exchange.close();
        });
        server.start();
    }

    @AfterEach
    void tearDown() {
        server.stop(0);
    }

    private ExternalSource restSource() {
        return ExternalSource.builder()
                .id("DS-RST-01")
                .name("Test REST source")
                .type(SourceType.REST)
                .endpointUrl("http://localhost:" + server.getAddress().getPort() + "/events")
                .authType(SourceAuthType.NONE)
                .build();
    }

    private void stubAlarmIncidentCreation() {
        when(incidentRepository.findByPrimaryDeviceIdOrderByCreatedAtDesc("DEV-RST-1"))
                .thenReturn(List.of());
        when(incidentService.createIncident(any())).thenReturn(IncidentDetails.builder()
                .id("INC-1")
                .status(IncidentStatus.OPEN)
                .build());
        when(incidentRepository.findById("INC-1"))
                .thenReturn(Optional.of(Incident.builder().id("INC-1").status(IncidentStatus.OPEN).build()));
    }

    @Test
    @DisplayName("Should forward since cursor and ingest a batch array")
    void shouldForwardSinceAndIngestBatch() {
        responseBody = "[" + SNAPSHOT_MESSAGE + "," + ALARM_MESSAGE + "]";
        stubAlarmIncidentCreation();

        SyncFetchResult result = connector.fetch(restSource(), Instant.parse("2026-11-24T00:00:00Z"));

        String query = URLDecoder.decode(lastRequestUri.get().getQuery(), StandardCharsets.UTF_8);
        assertTrue(query.contains("since=2026-11-24T00:00:00Z"));
        assertTrue(result.success());
        assertEquals(2, result.recordsFetched());
        assertEquals(0, result.recordsFailed());
        ArgumentCaptor<com.gr2.noc.telemetry.dto.create.RecordDeviceTelemetrySnapshotRequest> captor =
                ArgumentCaptor.forClass(com.gr2.noc.telemetry.dto.create.RecordDeviceTelemetrySnapshotRequest.class);
        verify(telemetryService).recordSnapshot(eq("DEV-RST-1"), captor.capture());
        assertEquals(42.0, captor.getValue().cpuPercent());
        verify(alarmRepository).save(any());
    }

    @Test
    @DisplayName("Should ingest a single message object without since param")
    void shouldIngestSingleMessageWithoutSince() {
        responseBody = SNAPSHOT_MESSAGE;

        SyncFetchResult result = connector.fetch(restSource(), null);

        assertTrue(result.success());
        assertEquals(1, result.recordsFetched());
        assertEquals(null, lastRequestUri.get().getQuery());
        verify(telemetryService).recordSnapshot(eq("DEV-RST-1"), any());
    }

    @Test
    @DisplayName("Should fail when response is not a message envelope")
    void shouldFailOnNonMessageResponse() {
        responseBody = "{\"foo\": 1}";

        SyncFetchResult result = connector.fetch(restSource(), null);

        assertFalse(result.success());
        assertTrue(result.message().contains("type"));
    }

    @Test
    @DisplayName("Should fail when part of the batch cannot be ingested")
    void shouldFailOnPartialBatchFailure() {
        responseBody = "[" + SNAPSHOT_MESSAGE + ",{\"type\":\"alarm\"}]";

        SyncFetchResult result = connector.fetch(restSource(), null);

        assertFalse(result.success());
        assertTrue(result.message().contains("1/2"));
        assertTrue(result.message().contains("payload"));
    }

    @Test
    @DisplayName("Should treat empty body as successful empty batch")
    void shouldTreatEmptyBodyAsSuccess() {
        responseBody = "";

        SyncFetchResult result = connector.fetch(restSource(), null);

        assertTrue(result.success());
        assertEquals(0, result.recordsFetched());
    }

    @Test
    @DisplayName("Should fail on non-JSON response body")
    void shouldFailOnNonJsonBody() {
        responseBody = "<html>oops</html>";

        SyncFetchResult result = connector.fetch(restSource(), null);

        assertFalse(result.success());
        assertTrue(result.message().contains("không phải JSON hợp lệ"));
    }

    @Test
    @DisplayName("Should fail on HTTP error status")
    void shouldFailOnHttpErrorStatus() {
        responseStatus = 500;

        SyncFetchResult result = connector.fetch(restSource(), null);

        assertFalse(result.success());
        assertTrue(result.message().contains("500"));
    }

    @Test
    @DisplayName("Should use HTTP/1.1 without h2c upgrade headers for plaintext http endpoints")
    void shouldUseHttp11WithoutH2cUpgradeForPlaintextHttp() {
        responseBody = "[]";

        SyncFetchResult result = connector.fetch(restSource(), null);

        assertTrue(result.success());
        assertEquals("HTTP/1.1", lastRequestProtocol.get());
        Headers headers = lastRequestHeaders.get();
        assertFalse(headers.containsKey("Upgrade"));
        assertFalse(headers.containsKey("HTTP2-Settings"));
    }
}
