package com.gr2.noc.document.service;

import com.gr2.noc.document.enums.IndexingStatus;
import com.gr2.noc.document.model.TechnicalDocument;
import com.gr2.noc.document.repository.TechnicalDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.unit.DataSize;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentIndexingService {

    private static final Set<String> SUPPORTED_FORMATS = Set.of("MD", "TXT");

    private final TechnicalDocumentRepository documentRepository;
    private final DocumentStorageService documentStorageService;

    @Value("${app.documents.max-file-size:100MB}")
    private DataSize maxFileSize;

    public void process(String documentId) {
        if (documentId == null) {
            return;
        }
        documentRepository.findById(documentId).ifPresent(document -> {
            if (document == null) {
                return;
            }
            try {
                index(document);
            } catch (Exception e) {
                log.warn("Failed to index document {}: {}", documentId, e.getMessage());
                markFailed(document, "Không đọc được nội dung tệp");
            }
            documentRepository.save(document);
        });
    }

    private void index(TechnicalDocument document) {
        if (document.getFileFormat() == null
                || !SUPPORTED_FORMATS.contains(document.getFileFormat().toUpperCase())) {
            markFailed(document, "Định dạng tệp không được hỗ trợ (chỉ chấp nhận .md, .txt)");
            return;
        }
        if (document.getFileSizeBytes() != null && document.getFileSizeBytes() > maxFileSize.toBytes()) {
            markFailed(document, "Tệp quá lớn (giới hạn " + maxFileSize.toMegabytes() + " MB)");
            return;
        }
        String text = documentStorageService.readAsText(document.getStoragePath());
        document.setContent(text);
        document.setIndexingStatus(IndexingStatus.READY);
        document.setStatusReason(null);
    }

    private void markFailed(TechnicalDocument document, String reason) {
        document.setIndexingStatus(IndexingStatus.FAILED);
        document.setStatusReason(reason);
        document.setContent(null);
    }
}
