package com.gr2.noc.source.config;

import com.gr2.noc.source.enums.SourceAuthType;
import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.model.ExternalSource;
import com.gr2.noc.source.repository.ExternalSourceRepository;
import com.gr2.noc.source.repository.SourceSyncRecordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
@DirtiesContext
class SourceDataInitializerIntegrationTest {

    @Autowired
    private ExternalSourceRepository sourceRepository;

    @Autowired
    private SourceSyncRecordRepository syncRecordRepository;

    @Test
    @DisplayName("Should seed only the mock REST data source with API key auth when dev profile is active")
    void shouldSeedSourcesWhenDevProfileActive() {
        List<ExternalSource> sources = sourceRepository.findAllByOrderByCreatedAtAsc();
        assertThat(sources).hasSize(1);

        ExternalSource mockSource = sourceRepository.findById("DS-MOCK-01").orElseThrow();
        assertThat(mockSource.getName()).isEqualTo("Mock FastAPI Source");
        assertThat(mockSource.getType()).isEqualTo(SourceType.REST);
        assertThat(mockSource.getEndpointUrl()).isEqualTo("http://localhost:8001/events");
        assertThat(mockSource.getPollIntervalSeconds()).isEqualTo(5);
        assertThat(mockSource.getStatus()).isEqualTo(SourceStatus.PENDING_FIRST_SYNC);
        assertThat(mockSource.getAuthType()).isEqualTo(SourceAuthType.API_KEY);
        assertThat(mockSource.getAuthToken()).isEqualTo("noc-mock-dev-key");
        assertThat(mockSource.getLastSyncAt()).isNull();

        assertThat(syncRecordRepository.findBySourceIdOrderByStartedAtDesc(mockSource.getId())).isEmpty();
    }
}
