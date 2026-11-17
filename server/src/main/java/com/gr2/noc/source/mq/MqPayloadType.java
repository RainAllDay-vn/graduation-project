package com.gr2.noc.source.mq;

public enum MqPayloadType {
    TELEMETRY_SNAPSHOT("telemetry.snapshot"),
    TELEMETRY_POINTS("telemetry.points"),
    ALARM("alarm");

    private final String wire;

    MqPayloadType(String wire) {
        this.wire = wire;
    }

    public String wire() {
        return wire;
    }

    public static MqPayloadType fromWire(String value) {
        for (MqPayloadType candidate : values()) {
            if (candidate.wire.equals(value)) {
                return candidate;
            }
        }
        throw new IllegalArgumentException("Loại thông điệp không hỗ trợ: " + value);
    }
}
