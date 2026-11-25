package com.gr2.noc.config;

import org.neo4j.cypherdsl.core.renderer.Configuration;
import org.neo4j.cypherdsl.core.renderer.Dialect;
import org.springframework.context.annotation.Bean;

/**
 * Configures Spring Data Neo4j's Cypher-DSL renderer for Neo4j 5 so
 * generated queries use {@code elementId(...)} instead of the deprecated {@code id(...)}.
 */
@org.springframework.context.annotation.Configuration
public class Neo4jConfig {

    @Bean
    public Configuration cypherDslConfiguration() {
        return Configuration.newConfig()
                .withDialect(Dialect.NEO4J_5)
                .build();
    }
}
