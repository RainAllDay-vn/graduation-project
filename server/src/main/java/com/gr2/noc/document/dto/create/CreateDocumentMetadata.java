package com.gr2.noc.document.dto.create;

import com.gr2.noc.document.enums.DocType;
import com.gr2.noc.document.enums.DocumentSource;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record CreateDocumentMetadata(
    @NotBlank(message = "Title is required")
    String title,

    DocType docType,

    DocumentSource source
) {
}
