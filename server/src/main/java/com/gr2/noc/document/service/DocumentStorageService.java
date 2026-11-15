package com.gr2.noc.document.service;

import org.springframework.core.io.Resource;

import java.io.InputStream;

public interface DocumentStorageService {

    /**
     * Store a document file as a versioned object and return the relative storage path.
     */
    String store(String documentId, int version, String originalFileName, InputStream content);

    /**
     * Read a stored file as UTF-8 text using its relative storage path.
     */
    String readAsText(String storagePath);

    /**
     * Open a stored file as a downloadable resource using its relative storage path.
     */
    Resource readAsResource(String storagePath);

    /**
     * Delete every stored version of a document.
     */
    void deleteDocumentFolder(String documentId);
}
