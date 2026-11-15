package com.gr2.noc.document.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.stream.Stream;

@Component
public class LocalDocumentStorageService implements DocumentStorageService {

    private static final String DOCUMENT_FOLDER_PREFIX = "docs";

    private final Path storageRoot;

    public LocalDocumentStorageService(@Value("${app.documents.storage-dir}") String storageDir) {
        this.storageRoot = Path.of(storageDir).toAbsolutePath().normalize();
    }

    @Override
    public String store(String documentId, int version, String originalFileName, InputStream content) {
        String extension = extractExtension(originalFileName);
        Path target = documentFolder(documentId).resolve("v" + version + "." + extension);
        try {
            Files.createDirectories(target.getParent());
            Files.copy(content, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store document file");
        }
        return storageRoot.relativize(target).toString();
    }

    @Override
    public String readAsText(String storagePath) {
        Path path = resolveGuarded(storagePath);
        try {
            return Files.readString(path, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read document file");
        }
    }

    @Override
    public Resource readAsResource(String storagePath) {
        return new FileSystemResource(resolveGuarded(storagePath));
    }

    @Override
    public void deleteDocumentFolder(String documentId) {
        Path folder = documentFolder(documentId);
        if (!Files.exists(folder)) {
            return;
        }
        try (Stream<Path> paths = Files.walk(folder)) {
            paths.sorted(Comparator.reverseOrder()).forEach(path -> {
                try {
                    Files.delete(path);
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            });
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete document files");
        }
    }

    private Path documentFolder(String documentId) {
        return storageRoot.resolve(DOCUMENT_FOLDER_PREFIX).resolve(documentId);
    }

    @NonNull
    private Path resolveGuarded(String relativePath) {
        Path resolved = storageRoot.resolve(relativePath).normalize();
        if (!resolved.startsWith(storageRoot)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid storage path");
        }
        return resolved;
    }

    private String extractExtension(String originalFileName) {
        String name = originalFileName != null ? originalFileName : "document";
        int dot = name.lastIndexOf('.');
        if (dot < 0 || dot == name.length() - 1) {
            return "bin";
        }
        return name.substring(dot + 1).toLowerCase();
    }
}
