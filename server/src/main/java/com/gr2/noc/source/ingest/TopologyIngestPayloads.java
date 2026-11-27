package com.gr2.noc.source.ingest;

import com.fasterxml.jackson.databind.JsonNode;
import com.gr2.noc.service.dto.create.CreateNetworkServiceRequest;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.dto.create.CreateLinkRequest;
import com.gr2.noc.topology.dto.update.UpdateDeviceStatusRequest;
import com.gr2.noc.topology.dto.update.UpdateLinkStatusRequest;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.enums.LinkType;

import java.util.ArrayList;
import java.util.List;

/**
 * Wire contract payload models and parsers for topology and service ingestion messages.
 */
public final class TopologyIngestPayloads {

    private TopologyIngestPayloads() {
    }

    public record NodeStatusPayload(String id, UpdateDeviceStatusRequest request) {
    }

    public record NodeRemovedPayload(String id, boolean hardDelete) {
    }

    public record LinkStatusPayload(String linkId, UpdateLinkStatusRequest request) {
    }

    public record LinkRemovedPayload(String linkId, boolean hardDelete) {
    }

    public record ServiceStatusPayload(String id, ServiceStatus status) {
    }

    public record ServiceDependencyPayload(String id, List<String> dependentDeviceIds) {
    }

    public static CreateDeviceRequest parseNodeDiscovered(JsonNode payload) {
        return CreateDeviceRequest.builder()
                .id(requiredText(payload, "id"))
                .name(requiredText(payload, "name"))
                .layer(requiredEnum(DeviceLayer.class, payload, "layer"))
                .region(optionalText(payload, "region"))
                .site(optionalText(payload, "site"))
                .ipAddress(optionalText(payload, "ipAddress"))
                .model(optionalText(payload, "model"))
                .status(optionalEnum(DeviceStatus.class, payload, "status"))
                .accessDeviceCount(readInt(payload.get("accessDeviceCount")))
                .accessErrorCount(readInt(payload.get("accessErrorCount")))
                .build();
    }

    public static NodeStatusPayload parseNodeStatus(JsonNode payload) {
        String id = requiredTextAny(payload, "id", "deviceId");
        UpdateDeviceStatusRequest request = UpdateDeviceStatusRequest.builder()
                .status(requiredEnum(DeviceStatus.class, payload, "status"))
                .accessDeviceCount(readInt(payload.get("accessDeviceCount")))
                .accessErrorCount(readInt(payload.get("accessErrorCount")))
                .build();
        return new NodeStatusPayload(id, request);
    }

    public static NodeRemovedPayload parseNodeRemoved(JsonNode payload) {
        String id = requiredTextAny(payload, "id", "deviceId");
        boolean hardDelete = Boolean.TRUE.equals(readBoolean(payload.get("hardDelete")));
        return new NodeRemovedPayload(id, hardDelete);
    }

    public static CreateLinkRequest parseLinkDiscovered(JsonNode payload) {
        return CreateLinkRequest.builder()
                .linkId(requiredText(payload, "linkId"))
                .sourceDeviceId(requiredText(payload, "sourceDeviceId"))
                .targetDeviceId(requiredText(payload, "targetDeviceId"))
                .sourcePort(requiredText(payload, "sourcePort"))
                .targetPort(requiredText(payload, "targetPort"))
                .linkType(optionalEnum(LinkType.class, payload, "linkType"))
                .capacityGbps(readInt(payload.get("capacityGbps")))
                .operStatus(optionalText(payload, "operStatus"))
                .rxPowerDbm(readDouble(payload.get("rxPowerDbm")))
                .txPowerDbm(readDouble(payload.get("txPowerDbm")))
                .utilizationPercent(readDouble(payload.get("utilizationPercent")))
                .isBackup(readBoolean(payload.get("isBackup")))
                .build();
    }

    public static LinkStatusPayload parseLinkStatus(JsonNode payload) {
        String linkId = requiredText(payload, "linkId");
        String operStatus = optionalText(payload, "operStatus");
        Double utilizationPercent = readDouble(payload.get("utilizationPercent"));
        Double rxPowerDbm = readDouble(payload.get("rxPowerDbm"));
        Double txPowerDbm = readDouble(payload.get("txPowerDbm"));
        if (operStatus == null && utilizationPercent == null && rxPowerDbm == null && txPowerDbm == null) {
            throw new IllegalArgumentException(
                    "payload phải có ít nhất một trường cập nhật (operStatus, utilizationPercent, rxPowerDbm, txPowerDbm)");
        }
        return new LinkStatusPayload(linkId, UpdateLinkStatusRequest.builder()
                .operStatus(operStatus)
                .utilizationPercent(utilizationPercent)
                .rxPowerDbm(rxPowerDbm)
                .txPowerDbm(txPowerDbm)
                .build());
    }

    public static LinkRemovedPayload parseLinkRemoved(JsonNode payload) {
        String linkId = requiredText(payload, "linkId");
        boolean hardDelete = Boolean.TRUE.equals(readBoolean(payload.get("hardDelete")));
        return new LinkRemovedPayload(linkId, hardDelete);
    }

    public static CreateNetworkServiceRequest parseServiceDiscovered(JsonNode payload) {
        return CreateNetworkServiceRequest.builder()
                .id(requiredText(payload, "id"))
                .name(requiredText(payload, "name"))
                .description(optionalText(payload, "description"))
                .type(requiredEnum(ServiceType.class, payload, "type"))
                .region(optionalText(payload, "region"))
                .status(optionalEnum(ServiceStatus.class, payload, "status"))
                .subscriberCount(readInt(payload.get("subscriberCount")))
                .dependentDeviceIds(optionalStringList(payload, "dependentDeviceIds"))
                .build();
    }

    public static ServiceStatusPayload parseServiceStatus(JsonNode payload) {
        String id = requiredTextAny(payload, "id", "serviceId");
        ServiceStatus status = requiredEnum(ServiceStatus.class, payload, "status");
        return new ServiceStatusPayload(id, status);
    }

    public static ServiceDependencyPayload parseServiceDependency(JsonNode payload) {
        String id = requiredTextAny(payload, "id", "serviceId");
        JsonNode deps = payload.get("dependentDeviceIds");
        if (deps == null || !deps.isArray()) {
            throw new IllegalArgumentException("Thiếu trường bắt buộc: payload.dependentDeviceIds (array)");
        }
        return new ServiceDependencyPayload(id, readStringList(deps, "dependentDeviceIds"));
    }

    static String requiredText(JsonNode payload, String field) {
        String value = optionalText(payload, field);
        if (value == null) {
            throw new IllegalArgumentException("Thiếu trường bắt buộc: payload." + field);
        }
        return value;
    }

    static String requiredTextAny(JsonNode payload, String primaryField, String fallbackField) {
        String value = optionalText(payload, primaryField);
        if (value != null) {
            return value;
        }
        String fallback = optionalText(payload, fallbackField);
        if (fallback != null) {
            return fallback;
        }
        throw new IllegalArgumentException("Thiếu trường bắt buộc: payload." + primaryField);
    }

    static String optionalText(JsonNode payload, String field) {
        JsonNode node = payload.get(field);
        if (node == null || node.isNull()) {
            return null;
        }
        if (!node.isValueNode()) {
            throw new IllegalArgumentException("payload." + field + " phải là chuỗi");
        }
        String value = node.asText().trim();
        return value.isBlank() ? null : value;
    }

    static <E extends Enum<E>> E parseEnum(Class<E> type, String wire) {
        if (wire == null || wire.isBlank()) {
            return null;
        }
        try {
            return Enum.valueOf(type, wire.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    static <E extends Enum<E>> E requiredEnum(Class<E> type, JsonNode payload, String field) {
        String wire = requiredText(payload, field);
        E value = parseEnum(type, wire);
        if (value == null) {
            throw new IllegalArgumentException("payload." + field + " không hợp lệ: " + wire);
        }
        return value;
    }

    static <E extends Enum<E>> E optionalEnum(Class<E> type, JsonNode payload, String field) {
        String wire = optionalText(payload, field);
        if (wire == null) {
            return null;
        }
        E value = parseEnum(type, wire);
        if (value == null) {
            throw new IllegalArgumentException("payload." + field + " không hợp lệ: " + wire);
        }
        return value;
    }

    static Double readDouble(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (!node.isNumber()) {
            throw new IllegalArgumentException("Giá trị số thực không hợp lệ: " + node.asText());
        }
        return node.asDouble();
    }

    static Long readLong(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (!node.isNumber()) {
            throw new IllegalArgumentException("Giá trị số nguyên không hợp lệ: " + node.asText());
        }
        return node.asLong();
    }

    static Integer readInt(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (!node.isNumber()) {
            throw new IllegalArgumentException("Giá trị số nguyên không hợp lệ: " + node.asText());
        }
        return node.asInt();
    }

    static Boolean readBoolean(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        if (!node.isBoolean()) {
            throw new IllegalArgumentException("Giá trị boolean không hợp lệ: " + node.asText());
        }
        return node.asBoolean();
    }

    private static List<String> optionalStringList(JsonNode payload, String field) {
        JsonNode node = payload.get(field);
        if (node == null || node.isNull()) {
            return null;
        }
        if (!node.isArray()) {
            throw new IllegalArgumentException("payload." + field + " phải là mảng chuỗi");
        }
        return readStringList(node, field);
    }

    private static List<String> readStringList(JsonNode arrayNode, String field) {
        List<String> values = new ArrayList<>();
        for (JsonNode element : arrayNode) {
            if (element == null || element.isNull() || !element.isTextual() || element.asText().isBlank()) {
                throw new IllegalArgumentException("payload." + field + " chứa phần tử không hợp lệ");
            }
            values.add(element.asText().trim());
        }
        return List.copyOf(values);
    }
}
