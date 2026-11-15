package com.gr2.noc.document.dto.get;

import com.gr2.noc.document.enums.DocType;
import com.gr2.noc.document.enums.DocumentSource;
import com.gr2.noc.document.enums.IndexingStatus;
import com.gr2.noc.document.model.TechnicalDocument;
import lombok.Builder;

import java.time.Instant;

@Builder
public record DocumentDetails(
    String id,
    String title,
    DocumentSource source,
    DocType docType,
    String fileName,
    String fileFormat,
    Long fileSizeBytes,
    int version,
    IndexingStatus indexingStatus,
    String statusReason,
    String content,
    String downloadUrl,
    Instant createdAt,
    Instant updatedAt
) {
    public static DocumentDetails from(TechnicalDocument document) {
        if (document == null) {
            return null;
        }
        return DocumentDetails.builder()
                .id(document.getId())
                .title(document.getTitle())
                .source(document.getSource())
                .docType(document.getDocType())
                .fileName(document.getFileName())
                .fileFormat(document.getFileFormat())
                .fileSizeBytes(document.getFileSizeBytes())
                .version(document.getVersion())
                .indexingStatus(document.getIndexingStatus())
                .statusReason(document.getStatusReason())
                .content(document.getContent())
                .downloadUrl("/api/documents/" + document.getId() + "/download")
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt() != null ? document.getUpdatedAt() : document.getCreatedAt())
                .build();
    }
}
