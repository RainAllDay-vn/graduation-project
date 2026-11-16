package com.gr2.noc.source.dto.get;

import com.gr2.noc.source.model.SourceFieldMapping;
import lombok.Builder;

@Builder
public record FieldMappingDto(
    String sourceField,
    String targetField
) {
    public static FieldMappingDto from(SourceFieldMapping mapping) {
        if (mapping == null) {
            return null;
        }
        return FieldMappingDto.builder()
                .sourceField(mapping.getSourceField())
                .targetField(mapping.getTargetField())
                .build();
    }

    public SourceFieldMapping toEntity() {
        return SourceFieldMapping.builder()
                .sourceField(sourceField)
                .targetField(targetField)
                .build();
    }
}
