package com.gr2.noc.document.service;

import com.gr2.noc.document.dto.create.CreateDocumentMetadata;
import com.gr2.noc.document.dto.get.DocumentDetails;
import com.gr2.noc.document.dto.get.DocumentSummary;
import com.gr2.noc.document.enums.DocType;
import com.gr2.noc.document.enums.DocumentSource;
import com.gr2.noc.document.enums.IndexingStatus;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {

    /**
     * Retrieve documents, optionally filtered by free-text query on title,
     * semantic type, indexing status and source.
     */
    List<DocumentSummary> getDocuments(String query, DocType docType, IndexingStatus indexingStatus, DocumentSource source);

    /**
     * Retrieve detailed information of a document, including its extracted text content.
     */
    DocumentDetails getDocumentById(String id);

    /**
     * Upload a new document file (.md/.txt), store it and start indexing.
     * Unsupported formats or oversized files are stored as FAILED documents.
     */
    DocumentDetails uploadDocument(CreateDocumentMetadata metadata, MultipartFile file);

    /**
     * Replace the file of an existing document, keeping the previous version
     * on storage and restarting the indexing process.
     */
    DocumentDetails replaceDocumentFile(String id, MultipartFile file);

    /**
     * Delete a document together with every stored version of its file.
     */
    void deleteDocument(String id);

    /**
     * Open the stored file of a document as a downloadable resource.
     */
    Resource downloadDocument(String id);
}
