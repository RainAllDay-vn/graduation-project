package com.gr2.noc.document.controller;

import com.gr2.noc.document.dto.create.CreateDocumentMetadata;
import com.gr2.noc.document.dto.get.DocumentDetails;
import com.gr2.noc.document.dto.get.DocumentSummary;
import com.gr2.noc.document.enums.DocType;
import com.gr2.noc.document.enums.DocumentSource;
import com.gr2.noc.document.enums.IndexingStatus;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST API contract for the technical-document library (Quản lý tài liệu page).
 * Upload, replace and delete knowledge files that the AI can cite during investigation.
 */
@RequestMapping("/api/documents")
public interface DocumentApi {

    /**
     * Retrieve documents, optionally filtered by free-text query on title,
     * semantic type, indexing status and source.
     */
    @GetMapping
    ResponseEntity<List<DocumentSummary>> getDocuments(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) DocType type,
            @RequestParam(required = false) IndexingStatus status,
            @RequestParam(required = false) DocumentSource source
    );

    /**
     * Retrieve detailed information of a document, including its extracted text content.
     */
    @GetMapping("/{id}")
    ResponseEntity<DocumentDetails> getDocumentById(@PathVariable String id);

    /**
     * Download the stored file of a document.
     */
    @GetMapping("/{id}/download")
    ResponseEntity<Resource> downloadDocument(@PathVariable String id);

    /**
     * Upload a new document file (.md/.txt). Unsupported formats or oversized
     * files are accepted but stored as FAILED documents with a status reason.
     */
    @PostMapping
    ResponseEntity<DocumentDetails> uploadDocument(
            @Valid @ModelAttribute CreateDocumentMetadata metadata,
            @RequestPart(value = "file", required = false) MultipartFile file
    );

    /**
     * Replace the file of an existing document. The previous version is kept
     * on storage and the indexing process restarts.
     */
    @PutMapping("/{id}/file")
    ResponseEntity<DocumentDetails> replaceDocumentFile(
            @PathVariable String id,
            @RequestPart(value = "file", required = false) MultipartFile file
    );

    /**
     * Delete a document together with every stored version of its file.
     */
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteDocument(@PathVariable String id);
}
