package com.gr2.noc.source.config;

import com.gr2.noc.source.enums.SourceAuthType;
import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.model.ExternalSource;
import com.gr2.noc.source.repository.ExternalSourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Seeds the mock external REST data source on startup (dev profile only)
 * when the data_sources table is empty.
 */
@Component
@Profile("dev")
@Order(6)
@RequiredArgsConstructor
@Slf4j
public class SourceDataInitializer implements CommandLineRunner {

    private final ExternalSourceRepository sourceRepository;

    @Value("${app.sources.mock.endpoint-url:http://localhost:8001/events}")
    private String mockEndpointUrl;

    @Value("${app.sources.mock.api-key:${MOCK_API_KEY:noc-mock-dev-key}}")
    private String mockApiKey;

    @Override
    @Transactional
    public void run(String... args) {
        if (sourceRepository.count() > 0) {
            log.info("Data source seed data already exists ({} records). Skipping initialization.", sourceRepository.count());
            return;
        }

        log.info("Seeding dev mock data source...");
        seedMockSource();
        log.info("Successfully seeded mock REST data source (DS-MOCK-01).");
    }

    private void seedMockSource() {
        ExternalSource source = ExternalSource.builder()
                .id("DS-MOCK-01")
                .name("Mock FastAPI Source")
                .type(SourceType.REST)
                .endpointUrl(mockEndpointUrl)
                .pollIntervalSeconds(5)
                .status(SourceStatus.PENDING_FIRST_SYNC)
                .authType(SourceAuthType.API_KEY)
                .authToken(mockApiKey)
                .createdAt(Instant.now())
                .build();
        if (source == null) {
            return;
        }
        sourceRepository.save(source);
    }
}
