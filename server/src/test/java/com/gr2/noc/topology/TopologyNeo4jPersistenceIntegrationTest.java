package com.gr2.noc.topology;

import com.gr2.noc.service.dto.create.CreateNetworkServiceRequest;
import com.gr2.noc.service.dto.get.NetworkServiceDetails;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.service.service.NetworkServiceService;
import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.dto.create.CreateLinkRequest;
import com.gr2.noc.topology.dto.get.DeviceDetails;
import com.gr2.noc.topology.dto.get.DeviceSummary;
import com.gr2.noc.topology.dto.get.LinkSummary;
import com.gr2.noc.topology.dto.get.TopologyGraph;
import com.gr2.noc.topology.dto.update.UpdateDeviceStatusRequest;
import com.gr2.noc.topology.dto.update.UpdateLinkStatusRequest;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.enums.LinkType;
import com.gr2.noc.topology.repository.NetworkDeviceRepository;
import com.gr2.noc.topology.service.TopologyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.Neo4jContainer;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Runs the full application context against a real Neo4j (Testcontainers).
 *
 * Guards against regressions where persistence fails silently and data is
 * only kept in memory (e.g. missing Neo4jTransactionManager when mixing JPA
 * and Spring Data Neo4j): every write here must be visible in the database
 * through raw Cypher, not just through the application layer.
 */
@SpringBootTest(properties = {
        // Re-enable the Neo4j auto-configurations excluded by the shared test config
        "spring.autoconfigure.exclude=org.springframework.ai.autoconfigure.vectorstore.pgvector.PgVectorStoreAutoConfiguration"
})
@ActiveProfiles({"dev", "real-neo4j"})
class TopologyNeo4jPersistenceIntegrationTest {

    static final Neo4jContainer<?> NEO4J = new Neo4jContainer<>("neo4j:5.26-community");

    static {
        NEO4J.start();
    }

    @DynamicPropertySource
    static void neo4jProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.neo4j.uri", NEO4J::getBoltUrl);
        registry.add("spring.neo4j.authentication.username", () -> "neo4j");
        registry.add("spring.neo4j.authentication.password", NEO4J::getAdminPassword);
    }

    @Autowired
    private TopologyService topologyService;

    @Autowired
    private NetworkServiceService networkServiceService;

    @Autowired
    private NetworkDeviceRepository networkDeviceRepository;

    @Autowired
    private Driver driver;

    @Test
    @DisplayName("Dev seed initializer persists devices and links into Neo4j")
    void shouldSeedTopologyIntoNeo4j() {
        List<Record> nodes = query("MATCH (d:NetworkDevice) RETURN d.id AS id");
        assertThat(nodes).extracting(r -> r.get("id").asString())
                .contains("SW-HN-02", "CORE-01", "CORE-02");

        List<Record> links = query(
                "MATCH (s:NetworkDevice)-[r:CONNECTED_TO]->(t:NetworkDevice) " +
                "RETURN s.id AS source, t.id AS target, r.link_id AS linkId, r.oper_status AS operStatus");
        assertThat(links).extracting(r -> r.get("linkId").asString())
                .contains("LINK-SW-HN-02-CORE-02");
    }

    @Test
    @DisplayName("Created device is written to Neo4j, not only kept in memory")
    void shouldPersistCreatedDevice() {
        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("IT-CYPER-01")
                .name("Persistence Probe")
                .layer(DeviceLayer.CORE)
                .region("Test")
                .ipAddress("10.9.0.1")
                .build());

        List<Record> nodes = query("MATCH (d:NetworkDevice {id: 'IT-CYPER-01'}) RETURN d.id AS id");
        assertThat(nodes).hasSize(1);
        assertThat(networkDeviceRepository.existsById("IT-CYPER-01")).isTrue();
    }

    @Test
    @DisplayName("Created link persists as a CONNECTED_TO relationship with properties")
    void shouldPersistCreatedLink() {
        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("IT-CYPER-A")
                .name("Link Probe A")
                .layer(DeviceLayer.CORE)
                .region("Test")
                .build());
        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("IT-CYPER-B")
                .name("Link Probe B")
                .layer(DeviceLayer.AGGREGATION)
                .region("Test")
                .build());

        LinkSummary link = topologyService.createLink(CreateLinkRequest.builder()
                .linkId("LINK-IT-CYPER-A-B")
                .sourceDeviceId("IT-CYPER-A")
                .targetDeviceId("IT-CYPER-B")
                .sourcePort("HundredGigE0/0/1")
                .targetPort("HundredGigE0/0/1")
                .linkType(LinkType.PHYSICAL_FIBER)
                .capacityGbps(100)
                .operStatus("UP")
                .build());

        assertThat(link.linkId()).isEqualTo("LINK-IT-CYPER-A-B");

        List<Record> rels = query(
                "MATCH (s:NetworkDevice {id: 'IT-CYPER-A'})-[r:CONNECTED_TO]->(t:NetworkDevice {id: 'IT-CYPER-B'}) " +
                "RETURN r.link_id AS linkId, r.oper_status AS operStatus, r.capacity_gbps AS capacity");
        assertThat(rels).hasSize(1);
        assertThat(rels.get(0).get("linkId").asString()).isEqualTo("LINK-IT-CYPER-A-B");
        assertThat(rels.get(0).get("operStatus").asString()).isEqualTo("UP");
        assertThat(rels.get(0).get("capacity").asInt()).isEqualTo(100);
    }

    @Test
    @DisplayName("Graph reads are served from Neo4j, including devices without links")
    void shouldReadGraphFromNeo4j() {
        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("IT-CYPER-LONE")
                .name("Lone Device Probe")
                .layer(DeviceLayer.EXCHANGE)
                .region("Test")
                .build());

        TopologyGraph graph = topologyService.getFullGraph();
        // A device without links must still be mapped (collect() over empty match)
        assertThat(graph.nodes()).extracting(n -> n.id()).contains("IT-CYPER-LONE");
    }

    @Test
    @DisplayName("Upsert, status update, and soft/hard remove persist device changes in Neo4j while preserving links")
    void shouldUpsertUpdateAndRemoveDevicesInNeo4j() {
        topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("IT-UPS-A")
                .name("Upsert Probe A")
                .layer(DeviceLayer.CORE)
                .region("Initial")
                .ipAddress("10.10.0.1")
                .build());
        topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("IT-UPS-B")
                .name("Upsert Probe B")
                .layer(DeviceLayer.AGGREGATION)
                .region("Initial")
                .build());
        topologyService.upsertLink(CreateLinkRequest.builder()
                .linkId("LINK-IT-UPS-AB")
                .sourceDeviceId("IT-UPS-A")
                .targetDeviceId("IT-UPS-B")
                .sourcePort("et-0/0/1")
                .targetPort("et-0/0/2")
                .build());

        // Re-upsert device A: updates metadata without wiping outgoing link
        DeviceDetails updated = topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("IT-UPS-A")
                .name("Upsert Probe A v2")
                .layer(DeviceLayer.CORE)
                .model("Nokia 7750 SR")
                .build());
        assertThat(updated.name()).isEqualTo("Upsert Probe A v2");
        assertThat(updated.region()).isEqualTo("Initial");
        assertThat(updated.model()).isEqualTo("Nokia 7750 SR");
        assertThat(query("MATCH (:NetworkDevice {id: 'IT-UPS-A'})-[r:CONNECTED_TO {link_id: 'LINK-IT-UPS-AB'}]->() RETURN r"))
                .hasSize(1);

        // Partial status update
        topologyService.updateDeviceStatus("IT-UPS-A", UpdateDeviceStatusRequest.builder()
                .status(DeviceStatus.DEGRADED)
                .accessDeviceCount(15)
                .accessErrorCount(2)
                .build());
        List<Record> statusRows = query(
                "MATCH (d:NetworkDevice {id: 'IT-UPS-A'}) RETURN d.status AS status, d.access_error_count AS errs");
        assertThat(statusRows.get(0).get("status").asString()).isEqualTo("DEGRADED");
        assertThat(statusRows.get(0).get("errs").asInt()).isEqualTo(2);

        // Soft remove marks OFFLINE; hard remove deletes node
        topologyService.removeDevice("IT-UPS-B", false);
        assertThat(query("MATCH (d:NetworkDevice {id: 'IT-UPS-B'}) RETURN d.status AS status")
                .get(0).get("status").asString()).isEqualTo("OFFLINE");

        topologyService.removeDevice("IT-UPS-B", true);
        assertThat(query("MATCH (d:NetworkDevice {id: 'IT-UPS-B'}) RETURN d")).isEmpty();
    }

    @Test
    @DisplayName("Upsert, move across sources, status update, and remove persist link changes in Neo4j")
    void shouldUpsertMoveUpdateAndRemoveLinksInNeo4j() {
        topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("IT-LNK-S1").name("Src 1").layer(DeviceLayer.CORE).build());
        topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("IT-LNK-S2").name("Src 2").layer(DeviceLayer.CORE).build());
        topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("IT-LNK-T").name("Target").layer(DeviceLayer.AGGREGATION).build());

        topologyService.upsertLink(CreateLinkRequest.builder()
                .linkId("LINK-IT-MOVE")
                .sourceDeviceId("IT-LNK-S1")
                .targetDeviceId("IT-LNK-T")
                .sourcePort("ge-0/0/1")
                .targetPort("ge-0/0/2")
                .capacityGbps(10)
                .build());

        // Move same linkId to S2 and update capacity
        topologyService.upsertLink(CreateLinkRequest.builder()
                .linkId("LINK-IT-MOVE")
                .sourceDeviceId("IT-LNK-S2")
                .targetDeviceId("IT-LNK-T")
                .sourcePort("et-0/0/1")
                .targetPort("et-0/0/2")
                .capacityGbps(100)
                .build());

        assertThat(query("MATCH ()-[r:CONNECTED_TO {link_id: 'LINK-IT-MOVE'}]->() RETURN r")).hasSize(1);
        List<Record> moved = query(
                "MATCH (s:NetworkDevice)-[r:CONNECTED_TO {link_id: 'LINK-IT-MOVE'}]->(t:NetworkDevice) " +
                "RETURN s.id AS src, t.id AS tgt, r.capacity_gbps AS cap");
        assertThat(moved.get(0).get("src").asString()).isEqualTo("IT-LNK-S2");
        assertThat(moved.get(0).get("cap").asInt()).isEqualTo(100);

        // Partial link status update
        topologyService.updateLinkStatus("LINK-IT-MOVE", UpdateLinkStatusRequest.builder()
                .operStatus("DEGRADED")
                .utilizationPercent(82.5)
                .rxPowerDbm(-18.2)
                .build());
        List<Record> updated = query(
                "MATCH ()-[r:CONNECTED_TO {link_id: 'LINK-IT-MOVE'}]->() " +
                "RETURN r.oper_status AS op, r.utilization_percent AS util, r.rx_power_dbm AS rx");
        assertThat(updated.get(0).get("op").asString()).isEqualTo("DEGRADED");
        assertThat(updated.get(0).get("util").asDouble()).isEqualTo(82.5);
        assertThat(updated.get(0).get("rx").asDouble()).isEqualTo(-18.2);

        // Soft remove sets DOWN; hard remove deletes edge
        topologyService.removeLink("LINK-IT-MOVE", false);
        assertThat(query("MATCH ()-[r:CONNECTED_TO {link_id: 'LINK-IT-MOVE'}]->() RETURN r.oper_status AS op")
                .get(0).get("op").asString()).isEqualTo("DOWN");

        topologyService.removeLink("LINK-IT-MOVE", true);
        assertThat(query("MATCH ()-[r:CONNECTED_TO {link_id: 'LINK-IT-MOVE'}]->() RETURN r")).isEmpty();
    }

    @Test
    @DisplayName("Upsert service, status update, and syncDependencies persist in Neo4j without clobbering device links")
    void shouldUpsertServiceAndSyncDependenciesInNeo4j() {
        topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("IT-SVC-D1").name("Svc Dev 1").layer(DeviceLayer.CORE).build());
        topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("IT-SVC-D2").name("Svc Dev 2").layer(DeviceLayer.AGGREGATION).build());
        topologyService.upsertLink(CreateLinkRequest.builder()
                .linkId("LINK-IT-SVC-12")
                .sourceDeviceId("IT-SVC-D1")
                .targetDeviceId("IT-SVC-D2")
                .sourcePort("et-0/0/1")
                .targetPort("et-0/0/2")
                .build());

        NetworkServiceDetails created = networkServiceService.upsertService(CreateNetworkServiceRequest.builder()
                .id("IT-SVC-01")
                .name("Test MPLS")
                .type(ServiceType.VPN_MPLS)
                .region("North")
                .subscriberCount(100)
                .dependentDeviceIds(List.of("IT-SVC-D1"))
                .build());
        assertThat(created.dependentDevices()).extracting(DeviceSummary::id).containsExactly("IT-SVC-D1");

        // Update metadata without dependentDeviceIds -> preserves DEPENDS_ON and device's CONNECTED_TO link
        NetworkServiceDetails updated = networkServiceService.upsertService(CreateNetworkServiceRequest.builder()
                .id("IT-SVC-01")
                .name("Test MPLS v2")
                .type(ServiceType.VPN_MPLS)
                .subscriberCount(250)
                .build());
        assertThat(updated.name()).isEqualTo("Test MPLS v2");
        assertThat(updated.dependentDevices()).extracting(DeviceSummary::id).containsExactly("IT-SVC-D1");

        // Update status
        networkServiceService.updateServiceStatus("IT-SVC-01", ServiceStatus.DEGRADED);
        assertThat(query("MATCH (s:NetworkService {id: 'IT-SVC-01'}) RETURN s.status AS st")
                .get(0).get("st").asString()).isEqualTo("DEGRADED");

        // Sync dependencies to D2
        NetworkServiceDetails synced = networkServiceService.syncDependencies("IT-SVC-01", List.of("IT-SVC-D2"));
        assertThat(synced.dependentDevices()).extracting(DeviceSummary::id).containsExactly("IT-SVC-D2");
        assertThat(query("MATCH (:NetworkService {id: 'IT-SVC-01'})-[:DEPENDS_ON]->(d:NetworkDevice) RETURN d.id AS id"))
                .extracting(r -> r.get("id").asString())
                .containsExactly("IT-SVC-D2");

        // Verify device D1's outgoing CONNECTED_TO link was NOT clobbered
        assertThat(query("MATCH (:NetworkDevice {id: 'IT-SVC-D1'})-[r:CONNECTED_TO {link_id: 'LINK-IT-SVC-12'}]->() RETURN r"))
                .hasSize(1);
    }

    private List<Record> query(String cypher) {
        try (Session session = driver.session()) {
            return session.run(cypher).list();
        }
    }
}
