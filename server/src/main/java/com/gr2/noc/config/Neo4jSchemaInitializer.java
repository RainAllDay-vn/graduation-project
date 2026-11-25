package com.gr2.noc.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Ensures Neo4j schema constraints, indexes, and relationship type tokens
 * exist before data initializers or repository queries run on an empty database.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
@Slf4j
public class Neo4jSchemaInitializer implements CommandLineRunner {

    private static final List<String> SCHEMA_STATEMENTS = List.of(
            "CREATE CONSTRAINT network_device_id_unique IF NOT EXISTS FOR (d:NetworkDevice) REQUIRE d.id IS UNIQUE",
            "CREATE CONSTRAINT network_service_id_unique IF NOT EXISTS FOR (s:NetworkService) REQUIRE s.id IS UNIQUE",
            "CREATE INDEX connected_to_link_id_idx IF NOT EXISTS FOR ()-[r:CONNECTED_TO]-() ON (r.link_id)",
            "CALL db.createRelationshipType('DEPENDS_ON')"
    );

    private final ObjectProvider<Driver> driverProvider;

    @Override
    public void run(String... args) {
        Driver driver = driverProvider.getIfAvailable();
        if (driver == null) {
            return;
        }
        try (Session session = driver.session()) {
            for (String cypher : SCHEMA_STATEMENTS) {
                session.run(cypher).consume();
            }
            log.debug("Verified Neo4j schema constraints, indexes, and relationship tokens.");
        }
    }
}
