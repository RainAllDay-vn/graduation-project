package com.gr2.noc.document.model;

import com.gr2.noc.document.enums.DocType;
import com.gr2.noc.document.enums.DocumentSource;
import com.gr2.noc.document.enums.IndexingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.lang.NonNull;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "documents", indexes = {
        @Index(name = "idx_documents_indexing_status", columnList = "indexing_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicalDocument {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 32)
    private DocType docType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private DocumentSource source = DocumentSource.MANUAL;

    @Column(name = "file_format", nullable = false, length = 8)
    private String fileFormat;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(nullable = false)
    @Builder.Default
    private int version = 1;

    @Column(name = "status_reason", columnDefinition = "TEXT")
    private String statusReason;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "document_fault_codes", joinColumns = @JoinColumn(name = "document_id"))
    @Column(name = "fault_code", length = 64)
    @Builder.Default
    private Set<String> targetFaultCodes = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "indexing_status", nullable = false, length = 16)
    @Builder.Default
    private IndexingStatus indexingStatus = IndexingStatus.INDEXING;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt;

    @NonNull
    public String getId() {
        return id;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
