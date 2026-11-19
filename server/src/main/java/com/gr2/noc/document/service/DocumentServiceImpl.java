package com.gr2.noc.document.service;

import com.gr2.noc.document.dto.create.CreateDocumentMetadata;
import com.gr2.noc.document.dto.get.DocumentDetails;
import com.gr2.noc.document.dto.get.DocumentSummary;
import com.gr2.noc.document.enums.DocType;
import com.gr2.noc.document.enums.DocumentSource;
import com.gr2.noc.document.enums.IndexingStatus;
import com.gr2.noc.document.model.TechnicalDocument;
import com.gr2.noc.document.repository.TechnicalDocumentRepository;
import com.gr2.noc.rag.service.TechnicalDocVectorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.Resource;
import org.springframework.core.task.TaskExecutor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class DocumentServiceImpl implements DocumentService {

    private final TechnicalDocumentRepository documentRepository;
    private final DocumentStorageService documentStorageService;
    private final DocumentIndexingService documentIndexingService;
    private final TaskExecutor documentIndexingExecutor;
    private final TechnicalDocVectorService technicalDocVectorService;

    public DocumentServiceImpl(
            TechnicalDocumentRepository documentRepository,
            DocumentStorageService documentStorageService,
            DocumentIndexingService documentIndexingService,
            @Qualifier("documentIndexingExecutor") TaskExecutor documentIndexingExecutor,
            TechnicalDocVectorService technicalDocVectorService
    ) {
        this.documentRepository = documentRepository;
        this.documentStorageService = documentStorageService;
        this.documentIndexingService = documentIndexingService;
        this.documentIndexingExecutor = documentIndexingExecutor;
        this.technicalDocVectorService = technicalDocVectorService;
    }

    @Override
    public List<DocumentSummary> getDocuments(String query, DocType docType, IndexingStatus indexingStatus, DocumentSource source) {
        List<TechnicalDocument> documents = (query != null && !query.isBlank())
                ? documentRepository.findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(query.trim())
                : documentRepository.findAllByOrderByCreatedAtDesc();
        return documents.stream()
                .filter(d -> docType == null || d.getDocType() == docType)
                .filter(d -> indexingStatus == null || d.getIndexingStatus() == indexingStatus)
                .filter(d -> source == null || d.getSource() == source)
                .map(DocumentSummary::from)
                .toList();
    }

    @Override
    public DocumentDetails getDocumentById(String id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document id is required");
        }
        return documentRepository.findById(id)
                .map(DocumentDetails::from)
                .orElseThrow(() -> notFound(id));
    }

    @Override
    public DocumentDetails uploadDocument(CreateDocumentMetadata metadata, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }

        TechnicalDocument document = TechnicalDocument.builder()
                .id(generateDocumentId())
                .title(metadata.title().trim())
                .docType(metadata.docType() != null ? metadata.docType() : DocType.OPERATION_RUNBOOK)
                .source(metadata.source() != null ? metadata.source() : DocumentSource.MANUAL)
                .build();
        if (document == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create document");
        }

        applyFileMetadata(document, file, 1);

        TechnicalDocument saved = documentRepository.save(document);
        dispatchIndexing(saved.getId());
        return documentRepository.findById(saved.getId())
                .map(DocumentDetails::from)
                .orElse(DocumentDetails.from(saved));
    }

    @Override
    public DocumentDetails replaceDocumentFile(String id, MultipartFile file) {
        TechnicalDocument document = findEntity(id);
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }

        applyFileMetadata(document, file, document.getVersion() + 1);

        TechnicalDocument saved = documentRepository.save(document);
        dispatchIndexing(saved.getId());
        return documentRepository.findById(saved.getId())
                .map(DocumentDetails::from)
                .orElse(DocumentDetails.from(saved));
    }

    @Override
    public void deleteDocument(String id) {
        TechnicalDocument document = findEntity(id);
        if (document == null) {
            throw notFound(id);
        }
        documentRepository.delete(document);
        technicalDocVectorService.deleteIndex(id);
        documentStorageService.deleteDocumentFolder(id);
    }

    @Override
    public Resource downloadDocument(String id) {
        TechnicalDocument document = findEntity(id);
        return documentStorageService.readAsResource(document.getStoragePath());
    }

    private TechnicalDocument findEntity(String id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Document id is required");
        }
        return documentRepository.findById(id)
                .orElseThrow(() -> notFound(id));
    }

    private void applyFileMetadata(TechnicalDocument document, MultipartFile file, int version) {
        String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String storagePath = documentStorageService.store(
                document.getId(), version, originalFileName, fileInputStream(file));
        document.setFileName(originalFileName);
        document.setFileFormat(extractFormat(originalFileName));
        document.setFileSizeBytes(file.getSize());
        document.setStoragePath(storagePath);
        document.setVersion(version);
        document.setIndexingStatus(IndexingStatus.INDEXING);
        document.setStatusReason(null);
        document.setContent(null);
    }

    private void dispatchIndexing(String documentId) {
        documentIndexingExecutor.execute(() -> documentIndexingService.process(documentId));
    }

    private String generateDocumentId() {
        String candidate;
        do {
            candidate = "DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (documentRepository.existsById(candidate));
        return candidate;
    }

    private String extractFormat(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot < 0 || dot == fileName.length() - 1) {
            return "UNKNOWN";
        }
        return fileName.substring(dot + 1).toUpperCase();
    }

    private InputStream fileInputStream(MultipartFile file) {
        try {
            return file.getInputStream();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot read uploaded file");
        }
    }

    private ResponseStatusException notFound(String id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found with ID: " + id);
    }
}
