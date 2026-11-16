package com.gr2.noc.settings.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class UserPreferenceDataConverter implements AttributeConverter<UserPreferenceData, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    @Override
    public String convertToDatabaseColumn(UserPreferenceData attribute) {
        if (attribute == null) {
            return "{}";
        }
        try {
            return MAPPER.writeValueAsString(attribute.withDefaults());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not serialize user preferences", e);
        }
    }

    @Override
    public UserPreferenceData convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new UserPreferenceData();
        }
        try {
            return MAPPER.readValue(dbData, UserPreferenceData.class).withDefaults();
        } catch (JsonProcessingException e) {
            return new UserPreferenceData();
        }
    }
}
