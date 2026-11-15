package com.gr2.noc.document.config;

import com.gr2.noc.document.enums.DocumentSource;
import com.gr2.noc.document.enums.IndexingStatus;
import com.gr2.noc.document.model.TechnicalDocument;
import com.gr2.noc.document.repository.TechnicalDocumentRepository;
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
class DocumentDataInitializerIntegrationTest {

    @Autowired
    private TechnicalDocumentRepository documentRepository;

    @Test
    @DisplayName("Should seed telecom SOP documents with all indexing states when dev profile is active")
    void shouldSeedDocumentsWhenDevProfileActive() {
        List<TechnicalDocument> documents = documentRepository.findAllByOrderByCreatedAtDesc();
        assertThat(documents).hasSizeGreaterThanOrEqualTo(4);

        TechnicalDocument fiberCutSop = documentRepository.findById("SOP-OPTICS-01").orElseThrow();
        assertThat(fiberCutSop.getIndexingStatus()).isEqualTo(IndexingStatus.READY);
        assertThat(fiberCutSop.getSource()).isEqualTo(DocumentSource.INTERNAL_WIKI);
        assertThat(fiberCutSop.getFileFormat()).isEqualTo("MD");
        assertThat(fiberCutSop.getContent()).contains("OTDR");

        TechnicalDocument sfpSop = documentRepository.findById("SOP-OPTICS-02").orElseThrow();
        assertThat(sfpSop.getIndexingStatus()).isEqualTo(IndexingStatus.READY);
        assertThat(sfpSop.getSource()).isEqualTo(DocumentSource.CONFLUENCE);

        TechnicalDocument bgpSop = documentRepository.findById("SOP-BGP-01").orElseThrow();
        assertThat(bgpSop.getIndexingStatus()).isEqualTo(IndexingStatus.READY);
        assertThat(bgpSop.getContent()).contains("BGP");

        TechnicalDocument failed = documents.stream()
                .filter(d -> d.getIndexingStatus() == IndexingStatus.FAILED)
                .findFirst()
                .orElseThrow();
        assertThat(failed.getFileFormat()).isEqualTo("CSV");
        assertThat(failed.getStatusReason()).contains("không được hỗ trợ");
        assertThat(failed.getContent()).isNull();
    }
}
