package com.gr2.noc.config;

import jakarta.persistence.EntityManagerFactory;
import org.neo4j.driver.Driver;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.neo4j.core.transaction.Neo4jTransactionManager;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * Declares explicit transaction managers so JPA (PostgreSQL) and Neo4j coexist.
 *
 * Without this configuration, Spring Boot's Neo4j auto-configuration backs off
 * (its Neo4jTransactionManager is {@code @ConditionalOnMissingBean(TransactionManager.class)}
 * because JPA already registered one). Neo4jTemplate then finds no
 * Neo4jTransactionManager in the context, leaving its internal TransactionTemplate
 * null — every Neo4j repository save/read throws a NullPointerException.
 *
 * TopologyServiceImpl silently swallows those failures and falls back to its
 * in-memory store, which makes the graph appear populated while the Neo4j
 * database stays empty (0 nodes).
 */
@Configuration
public class TransactionManagerConfig {

    /** Primary transaction manager for JPA repositories and unqualified @Transactional methods (PostgreSQL). */
    @Bean
    @Primary
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    /** Transaction manager used by Neo4jTemplate (discovered by type) and Neo4j repositories. */
    @Bean
    public Neo4jTransactionManager neo4jTransactionManager(ObjectProvider<Driver> driverProvider) {
        Driver driver = driverProvider.getIfAvailable();
        return driver == null ? null : new Neo4jTransactionManager(driver);
    }
}
