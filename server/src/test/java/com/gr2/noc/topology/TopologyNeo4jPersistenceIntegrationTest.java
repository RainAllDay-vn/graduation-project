package com.gr2.noc.topology;

import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.dto.create.CreateLinkRequest;
import com.gr2.noc.topology.dto.get.LinkSummary;
import com.gr2.noc.topology.dto.get.TopologyGraph;
import com.gr2.noc.topology.enums.DeviceLayer;
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

    private List<Record> query(String cypher) {
        try (Session session = driver.session()) {
            return session.run(cypher).list();
        }
    }
}
