package com.gr2.noc.source.ingest;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;

public record IngestMessage(
    IngestPayloadType type,
    Instant occurredAt,
    JsonNode payload
) {

    public static IngestMessage parse(ObjectMapper mapper, String raw) {
        JsonNode root;
        try {
            root = mapper.readTree(raw);
        } catch (Exception e) {
            throw new IllegalArgumentException("Thông điệp không phải JSON hợp lệ");
        }
        if (root == null || !root.isObject()) {
            throw new IllegalArgumentException("Thông điệp phải là một JSON object");
        }
        String typeWire = root.path("type").asText(null);
        if (typeWire == null || typeWire.isBlank()) {
            throw new IllegalArgumentException("Thiếu trường type");
        }
        JsonNode payload = root.get("payload");
        if (payload == null || !payload.isObject()) {
            throw new IllegalArgumentException("Thiếu trường payload (object)");
        }
        return new IngestMessage(IngestPayloadType.fromWire(typeWire), readInstant(root.get("occurredAt")), payload);
    }

    static Instant readInstant(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isNumber()) {
            return Instant.ofEpochMilli(node.asLong());
        }
        return Instant.parse(node.asText());
    }
}
