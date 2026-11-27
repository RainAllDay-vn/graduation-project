package com.gr2.noc.source.ingest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.incident.repository.AlarmRepository;
import com.gr2.noc.incident.repository.IncidentRepository;
import com.gr2.noc.incident.service.IncidentService;
import com.gr2.noc.service.dto.create.CreateNetworkServiceRequest;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.telemetry.service.TelemetryService;
import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.dto.create.CreateLinkRequest;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.enums.LinkType;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class TopologyIngestPayloadsTest {

    private final ObjectMapper mapper = new ObjectMapper();

    private JsonNode json(String raw) throws Exception {
        return mapper.readTree(raw);
    }

    @Test
    void shouldResolveAllTopologyAndServiceWireTypes() {
        assertEquals(IngestPayloadType.NODE_DISCOVERED, IngestPayloadType.fromWire("node.discovered"));
        assertEquals(IngestPayloadType.NODE_STATUS, IngestPayloadType.fromWire("node.status"));
        assertEquals(IngestPayloadType.NODE_REMOVED, IngestPayloadType.fromWire("node.removed"));
        assertEquals(IngestPayloadType.LINK_DISCOVERED, IngestPayloadType.fromWire("link.discovered"));
        assertEquals(IngestPayloadType.LINK_STATUS, IngestPayloadType.fromWire("link.status"));
        assertEquals(IngestPayloadType.LINK_REMOVED, IngestPayloadType.fromWire("link.removed"));
        assertEquals(IngestPayloadType.SERVICE_DISCOVERED, IngestPayloadType.fromWire("service.discovered"));
        assertEquals(IngestPayloadType.SERVICE_STATUS, IngestPayloadType.fromWire("service.status"));
        assertEquals(IngestPayloadType.SERVICE_DEPENDENCY, IngestPayloadType.fromWire("service.dependency"));
    }

    @Test
    void shouldParseNodeDiscoveredStatusAndRemoved() throws Exception {
        CreateDeviceRequest discovered = TopologyIngestPayloads.parseNodeDiscovered(json("""
                {
                  "id": "CORE-09",
                  "name": "Core Hanoi 09",
                  "layer": "core",
                  "region": "Miền Bắc - Hà Nội",
                  "site": "DC-HN-01",
                  "ipAddress": "10.10.0.9",
                  "model": "Cisco ASR 9904",
                  "status": "degraded",
                  "accessDeviceCount": 12,
                  "accessErrorCount": 2
                }
                """));
        assertEquals("CORE-09", discovered.id());
        assertEquals("Core Hanoi 09", discovered.name());
        assertEquals(DeviceLayer.CORE, discovered.layer());
        assertEquals(DeviceStatus.DEGRADED, discovered.status());
        assertEquals(12, discovered.accessDeviceCount());
        assertEquals(2, discovered.accessErrorCount());

        TopologyIngestPayloads.NodeStatusPayload status = TopologyIngestPayloads.parseNodeStatus(json("""
                {"deviceId": "CORE-09", "status": "CRITICAL", "accessErrorCount": 5}
                """));
        assertEquals("CORE-09", status.id());
        assertEquals(DeviceStatus.CRITICAL, status.request().status());
        assertEquals(5, status.request().accessErrorCount());

        TopologyIngestPayloads.NodeRemovedPayload removed = TopologyIngestPayloads.parseNodeRemoved(json("""
                {"id": "CORE-09", "hardDelete": true}
                """));
        assertEquals("CORE-09", removed.id());
        assertTrue(removed.hardDelete());
    }

    @Test
    void shouldParseLinkDiscoveredStatusAndRemoved() throws Exception {
        CreateLinkRequest link = TopologyIngestPayloads.parseLinkDiscovered(json("""
                {
                  "linkId": "LNK-CORE-09-01",
                  "sourceDeviceId": "CORE-09",
                  "targetDeviceId": "CORE-01",
                  "sourcePort": "et-0/0/1",
                  "targetPort": "et-0/0/2",
                  "linkType": "physical_fiber",
                  "capacityGbps": 100,
                  "operStatus": "UP",
                  "rxPowerDbm": -12.4,
                  "txPowerDbm": -3.1,
                  "utilizationPercent": 45.5,
                  "isBackup": false
                }
                """));
        assertEquals("LNK-CORE-09-01", link.linkId());
        assertEquals(LinkType.PHYSICAL_FIBER, link.linkType());
        assertEquals(100, link.capacityGbps());
        assertEquals(-12.4, link.rxPowerDbm());
        assertEquals(45.5, link.utilizationPercent());
        assertFalse(link.isBackup());

        TopologyIngestPayloads.LinkStatusPayload linkStatus = TopologyIngestPayloads.parseLinkStatus(json("""
                {"linkId": "LNK-CORE-09-01", "operStatus": "DOWN", "utilizationPercent": 0.0}
                """));
        assertEquals("LNK-CORE-09-01", linkStatus.linkId());
        assertEquals("DOWN", linkStatus.request().operStatus());
        assertEquals(0.0, linkStatus.request().utilizationPercent());

        TopologyIngestPayloads.LinkRemovedPayload linkRemoved = TopologyIngestPayloads.parseLinkRemoved(json("""
                {"linkId": "LNK-CORE-09-01"}
                """));
        assertEquals("LNK-CORE-09-01", linkRemoved.linkId());
        assertFalse(linkRemoved.hardDelete());
    }

    @Test
    void shouldParseServiceDiscoveredStatusAndDependency() throws Exception {
        CreateNetworkServiceRequest service = TopologyIngestPayloads.parseServiceDiscovered(json("""
                {
                  "id": "SVC-VPN-09",
                  "name": "Enterprise VPN 09",
                  "description": "MPLS VPN service",
                  "type": "vpn_mpls",
                  "region": "Miền Bắc - Hà Nội",
                  "status": "degraded",
                  "subscriberCount": 2500,
                  "dependentDeviceIds": ["CORE-01", "CORE-09"]
                }
                """));
        assertEquals("SVC-VPN-09", service.id());
        assertEquals(ServiceType.VPN_MPLS, service.type());
        assertEquals(ServiceStatus.DEGRADED, service.status());
        assertEquals(2500, service.subscriberCount());
        assertEquals(List.of("CORE-01", "CORE-09"), service.dependentDeviceIds());

        TopologyIngestPayloads.ServiceStatusPayload serviceStatus = TopologyIngestPayloads.parseServiceStatus(json("""
                {"serviceId": "SVC-VPN-09", "status": "OUTAGE"}
                """));
        assertEquals("SVC-VPN-09", serviceStatus.id());
        assertEquals(ServiceStatus.OUTAGE, serviceStatus.status());

        TopologyIngestPayloads.ServiceDependencyPayload deps = TopologyIngestPayloads.parseServiceDependency(json("""
                {"id": "SVC-VPN-09", "dependentDeviceIds": []}
                """));
        assertEquals("SVC-VPN-09", deps.id());
        assertTrue(deps.dependentDeviceIds().isEmpty());
    }

    @Test
    void shouldRejectInvalidOrMissingWireContractFields() throws Exception {
        assertThrows(IllegalArgumentException.class, () ->
                TopologyIngestPayloads.parseNodeDiscovered(json("""
                        {"id": "CORE-09", "name": "Missing Layer"}
                        """)));

        assertThrows(IllegalArgumentException.class, () ->
                TopologyIngestPayloads.parseNodeDiscovered(json("""
                        {"id": "CORE-09", "name": "Bad Status", "layer": "CORE", "status": "BROKEN"}
                        """)));

        assertThrows(IllegalArgumentException.class, () ->
                TopologyIngestPayloads.parseLinkStatus(json("""
                        {"linkId": "LNK-1"}
                        """)));

        assertThrows(IllegalArgumentException.class, () ->
                TopologyIngestPayloads.parseServiceDependency(json("""
                        {"id": "SVC-1", "dependentDeviceIds": ["CORE-01", ""]}
                        """)));
    }

    @Test
    void shouldValidateNewTypesInSourceIngestionServiceUntilPersistenceHandlersAreWired() {
        SourceIngestionService service = new SourceIngestionService(
                mock(TelemetryService.class),
                mock(IncidentService.class),
                mock(IncidentRepository.class),
                mock(AlarmRepository.class),
                mapper
        );

        IngestResult invalidNode = service.ingest("""
                {"type":"node.discovered","payload":{"id":"CORE-09"}}
                """);
        assertFalse(invalidNode.success());
        assertTrue(invalidNode.message().contains("payload.name"));

        IngestResult validNotYetWired = service.ingest("""
                {"type":"node.discovered","payload":{"id":"CORE-09","name":"Core 09","layer":"CORE"}}
                """);
        assertFalse(validNotYetWired.success());
        assertTrue(validNotYetWired.message().contains("node.discovered"));
    }
}
