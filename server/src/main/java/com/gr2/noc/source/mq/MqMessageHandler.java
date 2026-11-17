package com.gr2.noc.source.mq;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.incident.dto.create.CreateIncidentRequest;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.enums.AlarmType;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Alarm;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.AlarmRepository;
import com.gr2.noc.incident.repository.IncidentRepository;
import com.gr2.noc.incident.service.IncidentService;
import com.gr2.noc.telemetry.dto.create.RecordDeviceTelemetrySnapshotRequest;
import com.gr2.noc.telemetry.dto.create.RecordTelemetryPointRequest;
import com.gr2.noc.telemetry.enums.OperStatus;
import com.gr2.noc.telemetry.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Predicate;

@Service
@RequiredArgsConstructor
@Slf4j
public class MqMessageHandler {

    private static final Set<IncidentStatus> CLOSED_STATUSES = Set.of(IncidentStatus.MITIGATED, IncidentStatus.RESOLVED);

    private final TelemetryService telemetryService;
    private final IncidentService incidentService;
    private final IncidentRepository incidentRepository;
    private final AlarmRepository alarmRepository;
    private final ObjectMapper objectMapper;

    public MqIngestResult handle(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            return MqIngestResult.failed("Thông điệp rỗng");
        }
        try {
            MqMessage message = MqMessage.parse(objectMapper, rawJson);
            return switch (message.type()) {
                case TELEMETRY_SNAPSHOT -> handleTelemetrySnapshot(message.payload());
                case TELEMETRY_POINTS -> handleTelemetryPoints(message.payload());
                case ALARM -> handleAlarm(message.payload());
            };
        } catch (Exception e) {
            log.warn("Failed to ingest MQ message: {}", e.getMessage());
            return MqIngestResult.failed("Lỗi xử lý thông điệp: " + e.getMessage());
        }
    }

    private MqIngestResult handleTelemetrySnapshot(JsonNode payload) {
        String deviceId = requiredText(payload, "deviceId");
        String operStatusWire = payload.path("operStatus").asText(null);
        OperStatus operStatus = parseEnum(OperStatus.class, operStatusWire);
        if (operStatus == null) {
            return MqIngestResult.failed("payload.operStatus không hợp lệ: " + operStatusWire);
        }
        RecordDeviceTelemetrySnapshotRequest request = RecordDeviceTelemetrySnapshotRequest.builder()
                .collectedAt(MqMessage.readInstant(payload.get("collectedAt")))
                .operStatus(operStatus)
                .uptimeSeconds(readLong(payload.get("uptimeSeconds")))
                .loadPercentage(readDouble(payload.get("loadPercentage")))
                .routesLearned(readInt(payload.get("routesLearned")))
                .routesUsed(readInt(payload.get("routesUsed")))
                .cpuPercent(readDouble(payload.get("cpuPercent")))
                .memoryPercent(readDouble(payload.get("memoryPercent")))
                .temperatureCelsius(readDouble(payload.get("temperatureCelsius")))
                .build();
        telemetryService.recordSnapshot(deviceId, request);
        return MqIngestResult.success(1);
    }

    private MqIngestResult handleTelemetryPoints(JsonNode payload) {
        String deviceId = requiredText(payload, "deviceId");
        String defaultMetricName = payload.path("metricName").asText(null);
        String defaultUnit = payload.path("unit").asText(null);
        JsonNode points = payload.get("points");
        if (points == null || !points.isArray() || points.isEmpty()) {
            return MqIngestResult.failed("payload.points phải là mảng không rỗng");
        }
        List<RecordTelemetryPointRequest> requests = new ArrayList<>();
        int skipped = 0;
        for (JsonNode point : points) {
            Double value = readDouble(point.get("value"));
            String metricName = point.path("metricName").asText(defaultMetricName);
            if (value == null || metricName == null || metricName.isBlank()) {
                skipped++;
                continue;
            }
            requests.add(RecordTelemetryPointRequest.builder()
                    .metricName(metricName)
                    .value(value)
                    .unit(point.path("unit").asText(defaultUnit))
                    .timestamp(MqMessage.readInstant(point.get("timestamp")))
                    .build());
        }
        if (requests.isEmpty()) {
            return MqIngestResult.failed("Không có điểm đo hợp lệ trong payload.points");
        }
        int ingested = telemetryService.recordTimeseriesPoints(deviceId, requests);
        return MqIngestResult.success(ingested, skipped);
    }

    private MqIngestResult handleAlarm(JsonNode payload) {
        String deviceId = requiredText(payload, "deviceId");
        String faultCode = requiredText(payload, "faultCode");
        Severity severity = parseSeverity(payload.path("severity").asText(null));
        Instant timestamp = MqMessage.readInstant(payload.get("timestamp"));
        String message = payload.path("message").asText(null);

        Incident incident = findOpenIncident(deviceId);
        if (incident == null) {
            incident = createIncidentForAlarm(deviceId, faultCode, severity);
        }
        Alarm alarm = Alarm.builder()
                .id(generateId("ALM-", alarmRepository::existsById))
                .incident(incident)
                .deviceId(deviceId)
                .timestamp(timestamp != null ? timestamp : Instant.now())
                .severity(severity)
                .alarmType(AlarmType.FAULT_CODE)
                .faultCode(faultCode)
                .message(message)
                .isCurrentIncident(true)
                .build();
        alarmRepository.save(alarm);
        return MqIngestResult.success(1);
    }

    private Incident findOpenIncident(String deviceId) {
        return incidentRepository.findByPrimaryDeviceIdOrderByCreatedAtDesc(deviceId).stream()
                .filter(incident -> !CLOSED_STATUSES.contains(incident.getStatus()))
                .findFirst()
                .orElse(null);
    }

    private Incident createIncidentForAlarm(String deviceId, String faultCode, Severity severity) {
        IncidentDetails created = incidentService.createIncident(CreateIncidentRequest.builder()
                .id(generateId("INC-MQ-", incidentRepository::existsById))
                .title("Cảnh báo " + faultCode + " tại " + deviceId)
                .status(IncidentStatus.OPEN)
                .severity(severity)
                .primaryDeviceId(deviceId)
                .build());
        return incidentRepository.findById(created.id())
                .orElseThrow(() -> new IllegalStateException("Không tải lại được sự cố vừa tạo: " + created.id()));
    }

    private Severity parseSeverity(String wire) {
        Severity severity = parseEnum(Severity.class, wire);
        return severity != null ? severity : Severity.WARNING;
    }

    private <E extends Enum<E>> E parseEnum(Class<E> type, String wire) {
        if (wire == null || wire.isBlank()) {
            return null;
        }
        try {
            return Enum.valueOf(type, wire.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private String requiredText(JsonNode payload, String field) {
        String value = payload.path(field).asText(null);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Thiếu trường bắt buộc: payload." + field);
        }
        return value.trim();
    }

    private Double readDouble(JsonNode node) {
        return node != null && !node.isNull() ? node.asDouble() : null;
    }

    private Long readLong(JsonNode node) {
        return node != null && !node.isNull() ? node.asLong() : null;
    }

    private Integer readInt(JsonNode node) {
        return node != null && !node.isNull() ? node.asInt() : null;
    }

    private String generateId(String prefix, Predicate<String> exists) {
        String candidate;
        do {
            candidate = prefix + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (exists.test(candidate));
        return candidate;
    }
}
