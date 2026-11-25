package com.gr2.noc.source.ingest;

public enum IngestPayloadType {
    TELEMETRY_SNAPSHOT("telemetry.snapshot"),
    TELEMETRY_POINTS("telemetry.points"),
    ALARM("alarm");

    private final String wire;

    IngestPayloadType(String wire) {
        this.wire = wire;
    }

    public String wire() {
        return wire;
    }

    public static IngestPayloadType fromWire(String value) {
        for (IngestPayloadType candidate : values()) {
            if (candidate.wire.equals(value)) {
                return candidate;
            }
        }
        throw new IllegalArgumentException("Loại thông điệp không hỗ trợ: " + value);
    }
}
