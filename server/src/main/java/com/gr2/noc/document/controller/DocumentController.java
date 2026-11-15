package com.gr2.noc.document.controller;

import com.gr2.noc.document.dto.create.CreateDocumentMetadata;
import com.gr2.noc.document.dto.get.DocumentDetails;
import com.gr2.noc.document.dto.get.DocumentSummary;
import com.gr2.noc.document.enums.DocType;
import com.gr2.noc.document.enums.DocumentSource;
import com.gr2.noc.document.enums.IndexingStatus;
import com.gr2.noc.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DocumentController implements DocumentApi {

    private final DocumentService documentService;

    @Override
    public ResponseEntity<List<DocumentSummary>> getDocuments(
            String q, DocType type, IndexingStatus status, DocumentSource source
    ) {
        return ResponseEntity.ok(documentService.getDocuments(q, type, status, source));
    }

    @Override
    public ResponseEntity<DocumentDetails> getDocumentById(String id) {
        return ResponseEntity.ok(documentService.getDocumentById(id));
    }

    @Override
    public ResponseEntity<Resource> downloadDocument(String id) {
        DocumentDetails details = documentService.getDocumentById(id);
        Resource resource = documentService.downloadDocument(id);
        if (!resource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document file not found on storage");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_OCTET_STREAM_VALUE)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + details.fileName() + "\"")
                .body(resource);
    }

    @Override
    public ResponseEntity<DocumentDetails> uploadDocument(CreateDocumentMetadata metadata, MultipartFile file) {
        DocumentDetails details = documentService.uploadDocument(metadata, file);
        return ResponseEntity
                .created(UriComponentsBuilder.fromPath("/api/documents/{id}").build(details.id()))
                .body(details);
    }

    @Override
    public ResponseEntity<DocumentDetails> replaceDocumentFile(String id, MultipartFile file) {
        return ResponseEntity.ok(documentService.replaceDocumentFile(id, file));
    }

    @Override
    public ResponseEntity<Void> deleteDocument(String id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
