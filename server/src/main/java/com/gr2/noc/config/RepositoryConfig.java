package com.gr2.noc.config;

import org.springframework.boot.autoconfigure.condition.ConditionMessage;
import org.springframework.boot.autoconfigure.condition.ConditionOutcome;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.SpringBootCondition;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;

import java.util.List;

/**
 * Explicitly scopes JPA and Neo4j repository scanning to their respective
 * store packages so Spring Data does not scan every repository candidate
 * across both stores on startup.
 */
@Configuration
public class RepositoryConfig {

    @Configuration
    @ConditionalOnProperty(prefix = "spring.data.jpa.repositories", name = "enabled", havingValue = "true", matchIfMissing = true)
    @EnableJpaRepositories(basePackages = {
            "com.gr2.noc.auth.repository",
            "com.gr2.noc.document.repository",
            "com.gr2.noc.hypothesis.repository",
            "com.gr2.noc.incident.repository",
            "com.gr2.noc.settings.repository",
            "com.gr2.noc.source.repository",
            "com.gr2.noc.telemetry.repository"
    })
    static class JpaRepositoryConfig {
    }

    @Configuration
    @Conditional(Neo4jRepositoriesEnabledCondition.class)
    @EnableNeo4jRepositories(basePackages = {
            "com.gr2.noc.topology.repository",
            "com.gr2.noc.service.repository"
    })
    static class Neo4jRepositoryConfig {
    }

    /**
     * Mirrors Spring Boot's Neo4j repository auto-configuration guards so tests
     * that exclude Neo4j auto-configurations and provide in-memory repository
     * doubles do not register Neo4j repository beans.
     */
    static class Neo4jRepositoriesEnabledCondition extends SpringBootCondition {

        private static final List<String> NEO4J_AUTO_CONFIGS = List.of(
                "org.springframework.boot.autoconfigure.data.neo4j.Neo4jDataAutoConfiguration",
                "org.springframework.boot.autoconfigure.data.neo4j.Neo4jRepositoriesAutoConfiguration"
        );

        @Override
        public ConditionOutcome getMatchOutcome(ConditionContext context, AnnotatedTypeMetadata metadata) {
            ConditionMessage.Builder message = ConditionMessage.forCondition("Neo4jRepositoriesEnabled");
            Boolean enabled = context.getEnvironment()
                    .getProperty("spring.data.neo4j.repositories.enabled", Boolean.class, Boolean.TRUE);
            if (!Boolean.TRUE.equals(enabled)) {
                return ConditionOutcome.noMatch(message.because("spring.data.neo4j.repositories.enabled is false"));
            }

            String type = context.getEnvironment().getProperty("spring.data.neo4j.repositories.type", "auto");
            if ("none".equalsIgnoreCase(type)) {
                return ConditionOutcome.noMatch(message.because("spring.data.neo4j.repositories.type is none"));
            }

            List<String> excluded = Binder.get(context.getEnvironment())
                    .bind("spring.autoconfigure.exclude", Bindable.listOf(String.class))
                    .orElse(List.of());
            for (String autoConfig : NEO4J_AUTO_CONFIGS) {
                if (excluded.contains(autoConfig)) {
                    return ConditionOutcome.noMatch(message.because(autoConfig + " is excluded"));
                }
            }

            return ConditionOutcome.match(message.because("Neo4j repositories are enabled"));
        }
    }
}
