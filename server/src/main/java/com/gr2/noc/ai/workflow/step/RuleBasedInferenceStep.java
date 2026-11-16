package com.gr2.noc.ai.workflow.step;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.ai.dto.InvestigationContext;
import com.gr2.noc.ai.dto.RawInference;
import com.gr2.noc.rag.dto.TechnicalDocSnippet;
import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;
import com.gr2.noc.telemetry.dto.get.TelemetryTimeseriesPointDetails;
import com.gr2.noc.telemetry.enums.OperStatus;
import com.gr2.noc.topology.dto.get.LinkSummary;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Rule-based inference: deterministic thresholds over the evidence bundle emitting the
 * same JSON hypothesis schema as the LLM engine. Rules cover link degradation
 * (operStatus/RX power), BGP flaps, SFP overheating, and control-plane CPU overload,
 * with an evidence-only fallback so the pipeline always yields a draft.
 */
@Service
@ConditionalOnProperty(name = "app.ai.engine", havingValue = "rule-based", matchIfMissing = true)
public class RuleBasedInferenceStep implements InferenceStep {

    private static final String ENGINE_TYPE = "rule-based";
    private static final String TARGET_TYPE_NODE = "NODE";
    private static final String TARGET_TYPE_EDGE = "EDGE";
    private static final double DEGRADED_RX_THRESHOLD_DBM = -20.0;
    private static final double OVERHEAT_THRESHOLD_CELSIUS = 65.0;
    private static final double CPU_OVERLOAD_THRESHOLD_PERCENT = 85.0;
    private static final double CPU_TREND_RISE_PERCENT = 20.0;
    private static final double CPU_TREND_FLOOR_PERCENT = 70.0;

    private static final ObjectMapper JSON_MAPPER = new ObjectMapper();

    @Override
    public RawInference infer(InvestigationContext context) {
        DeviceTelemetrySnapshotDetails snapshot = context.telemetrySnapshot();
        String epicenterId = context.incident().primaryDeviceId();
        List<String> faultCodes = collectFaultCodes(context);
        Map<String, LinkSummary> degradedLinks = collectDegradedLinks(context);

        List<RuleHypothesis> hypotheses = new ArrayList<>();
        for (LinkSummary link : degradedLinks.values()) {
            hypotheses.add(buildLinkHypothesis(link, faultCodes, snapshot));
        }
        addBgpHypothesis(hypotheses, context, faultCodes);
        addThermalHypothesis(hypotheses, context, faultCodes, snapshot, epicenterId);
        addCpuHypothesis(hypotheses, context, snapshot, epicenterId);
        if (hypotheses.isEmpty()) {
            hypotheses.add(buildFallbackHypothesis(context));
        }

        hypotheses.sort((a, b) -> Integer.compare(b.matchScore, a.matchScore));
        List<RuleHypothesis> ranked = new ArrayList<>();
        for (int i = 0; i < hypotheses.size(); i++) {
            ranked.add(withRank(hypotheses.get(i), i + 1));
        }

        return RawInference.builder()
                .context(context)
                .rawContent(toJson(ranked))
                .engineType(ENGINE_TYPE)
                .consultedRunbooks(consultedRunbookTitles(context))
                .build();
    }

    private RuleHypothesis withRank(RuleHypothesis hypothesis, int rank) {
        return new RuleHypothesis(
                rank,
                hypothesis.matchScore(),
                hypothesis.title(),
                hypothesis.shortTitle(),
                hypothesis.targetType(),
                hypothesis.targetId(),
                hypothesis.sourceNode(),
                hypothesis.targetNode(),
                hypothesis.sourcePort(),
                hypothesis.targetPort(),
                hypothesis.confidenceRationale(),
                hypothesis.cliCommand(),
                hypothesis.verificationCmd(),
                hypothesis.evidence(),
                hypothesis.contradictingEvidence()
        );
    }

    private List<String> collectFaultCodes(InvestigationContext context) {
        return context.alarms() != null
                ? context.alarms().stream()
                        .map(alarm -> alarm.faultCode())
                        .filter(code -> code != null && !code.isBlank())
                        .map(code -> code.toUpperCase(Locale.ROOT))
                        .toList()
                : List.of();
    }

    private Map<String, LinkSummary> collectDegradedLinks(InvestigationContext context) {
        Map<String, LinkSummary> degraded = new LinkedHashMap<>();
        if (context.epicenterTopology() == null || context.epicenterTopology().links() == null) {
            return degraded;
        }
        for (LinkSummary link : context.epicenterTopology().links()) {
            if (link.linkId() == null || degraded.containsKey(link.linkId())) {
                continue;
            }
            if (isDegraded(link)) {
                degraded.put(link.linkId(), link);
            }
        }
        return degraded;
    }

    private boolean isDegraded(LinkSummary link) {
        String operStatus = link.operStatus();
        if ("DOWN".equalsIgnoreCase(operStatus) || "DEGRADED".equalsIgnoreCase(operStatus)) {
            return true;
        }
        return link.rxPowerDbm() != null && link.rxPowerDbm() < DEGRADED_RX_THRESHOLD_DBM;
    }

    private RuleHypothesis buildLinkHypothesis(LinkSummary link, List<String> faultCodes,
            DeviceTelemetrySnapshotDetails snapshot) {
        boolean down = "DOWN".equalsIgnoreCase(link.operStatus());
        List<String> evidence = new ArrayList<>();
        if (link.operStatus() != null) {
            evidence.add("Trạng thái cổng " + safePort(link.sourcePort()) + ": " + link.operStatus());
        }
        if (link.rxPowerDbm() != null) {
            evidence.add("Công suất thu RX = " + link.rxPowerDbm() + " dBm (ngưỡng suy hao "
                    + DEGRADED_RX_THRESHOLD_DBM + " dBm)");
        }
        faultCodes.stream()
                .filter(code -> code.contains("OPTIC") || code.contains("RX"))
                .forEach(evidence::add);

        List<String> contradicting = new ArrayList<>();
        if (snapshot != null && snapshot.cpuPercent() != null && snapshot.cpuPercent() < CPU_TREND_FLOOR_PERCENT) {
            contradicting.add("CPU thiết bị tâm chấn chỉ " + snapshot.cpuPercent()
                    + "% nên loại trừ quá tải control-plane");
        }

        int matchScore = down ? 90 : 78;
        return new RuleHypothesis(
                0,
                matchScore,
                (down ? "Mất kết nối" : "Suy hao tín hiệu") + " trên liên kết " + link.linkId(),
                down ? "Mất liên kết" : "Suy hao quang",
                TARGET_TYPE_EDGE,
                link.linkId(),
                link.sourceDeviceId(),
                link.targetDeviceId(),
                link.sourcePort(),
                link.targetPort(),
                "Liên kết " + link.linkId() + " ở trạng thái " + link.operStatus()
                        + (link.rxPowerDbm() != null ? " với RX " + link.rxPowerDbm() + " dBm" : ""),
                "show interfaces " + safePort(link.sourcePort()),
                "show optics " + safePort(link.sourcePort()),
                evidence,
                contradicting
        );
    }

    private void addBgpHypothesis(List<RuleHypothesis> hypotheses, InvestigationContext context,
            List<String> faultCodes) {
        boolean bgpFlap = faultCodes.stream().anyMatch(code -> code.contains("BGP"));
        if (!bgpFlap) {
            return;
        }
        String alarmDeviceId = context.alarms().stream()
                .filter(alarm -> alarm.faultCode() != null && alarm.faultCode().toUpperCase(Locale.ROOT).contains("BGP"))
                .map(alarm -> alarm.deviceId())
                .findFirst()
                .orElse(context.incident().primaryDeviceId());
        String targetId = nodeInGraph(context, alarmDeviceId) ? alarmDeviceId : null;

        List<String> evidence = new ArrayList<>();
        evidence.add("Mã cảnh báo BGP_FLAP phát hiện tại " + alarmDeviceId);
        context.alarms().stream()
                .filter(alarm -> alarm.message() != null && alarm.message().toUpperCase(Locale.ROOT).contains("BGP"))
                .map(alarm -> "Thông điệp cảnh báo: " + alarm.message())
                .findFirst()
                .ifPresent(evidence::add);
        List<String> contradicting = new ArrayList<>();
        DeviceTelemetrySnapshotDetails snapshot = context.telemetrySnapshot();
        if (snapshot != null && snapshot.cpuPercent() != null && snapshot.cpuPercent() < CPU_TREND_FLOOR_PERCENT) {
            contradicting.add("CPU thấp (" + snapshot.cpuPercent() + "%) nên flap BGP không do treo tiến trình CPU");
        }

        hypotheses.add(new RuleHypothesis(
                0,
                70,
                "Flap phiên BGP trên thiết bị " + alarmDeviceId,
                "BGP flap",
                targetId != null ? TARGET_TYPE_NODE : null,
                targetId,
                null,
                null,
                null,
                null,
                "Phiên BGP trên " + alarmDeviceId + " liên tục bị thiết lập lại",
                "show bgp summary",
                "show bgp neighbors | include Flap",
                evidence,
                contradicting
        ));
    }

    private void addThermalHypothesis(List<RuleHypothesis> hypotheses, InvestigationContext context,
            List<String> faultCodes, DeviceTelemetrySnapshotDetails snapshot, String epicenterId) {
        Double temperature = snapshot != null ? snapshot.temperatureCelsius() : null;
        boolean thermalAlarm = faultCodes.stream().anyMatch(code -> code.contains("TEMP"));
        boolean overheat = temperature != null && temperature > OVERHEAT_THRESHOLD_CELSIUS;
        if (!thermalAlarm && !overheat) {
            return;
        }
        String targetId = nodeInGraph(context, epicenterId) ? epicenterId : null;

        List<String> evidence = new ArrayList<>();
        if (temperature != null) {
            evidence.add("Nhiệt độ thiết bị " + temperature + "°C (ngưỡng quá nhiệt "
                    + OVERHEAT_THRESHOLD_CELSIUS + "°C)");
        }
        faultCodes.stream().filter(code -> code.contains("TEMP")).forEach(evidence::add);

        hypotheses.add(new RuleHypothesis(
                0,
                78,
                "Quá nhiệt module quang trên thiết bị " + epicenterId,
                "Quá nhiệt SFP",
                targetId != null ? TARGET_TYPE_NODE : null,
                targetId,
                null,
                null,
                null,
                null,
                "Nhiệt độ vượt ngưỡng làm suy giảm chất lượng tín hiệu quang",
                "show environment",
                "show hw-module all temperature",
                evidence,
                List.of()
        ));
    }

    private void addCpuHypothesis(List<RuleHypothesis> hypotheses, InvestigationContext context,
            DeviceTelemetrySnapshotDetails snapshot, String epicenterId) {
        Double cpu = snapshot != null ? snapshot.cpuPercent() : null;
        boolean cpuOverload = cpu != null && cpu > CPU_OVERLOAD_THRESHOLD_PERCENT;
        boolean cpuRising = isCpuRising(context.cpuTimeseries());
        if (!cpuOverload && !cpuRising) {
            return;
        }
        String targetId = nodeInGraph(context, epicenterId) ? epicenterId : null;

        List<String> evidence = new ArrayList<>();
        if (cpu != null) {
            evidence.add("CPU hiện tại " + cpu + "% (ngưỡng quá tải " + CPU_OVERLOAD_THRESHOLD_PERCENT + "%)");
        }
        if (cpuRising) {
            evidence.add("Xu hướng CPU tăng mạnh trong 1 giờ qua");
        }

        hypotheses.add(new RuleHypothesis(
                0,
                72,
                "Quá tải CPU control-plane trên thiết bị " + epicenterId,
                "Quá tải CPU",
                targetId != null ? TARGET_TYPE_NODE : null,
                targetId,
                null,
                null,
                null,
                null,
                "Tiến trình control-plane chiếm dụng CPU cao bất thường",
                "show processes cpu sort",
                "show processes cpu detailed",
                evidence,
                List.of()
        ));
    }

    private boolean isCpuRising(TelemetryMetricSeries series) {
        if (series == null || series.points() == null || series.points().size() < 2) {
            return false;
        }
        List<TelemetryTimeseriesPointDetails> points = series.points();
        Double first = points.get(0).value();
        Double last = points.get(points.size() - 1).value();
        return first != null && last != null
                && last - first >= CPU_TREND_RISE_PERCENT
                && last >= CPU_TREND_FLOOR_PERCENT;
    }

    private RuleHypothesis buildFallbackHypothesis(InvestigationContext context) {
        int alarmCount = context.alarms() != null ? context.alarms().size() : 0;
        List<String> evidence = new ArrayList<>();
        evidence.add("Sự cố có " + alarmCount + " cảnh báo đang kích hoạt");
        if (context.alarms() != null) {
            context.alarms().stream()
                    .map(alarm -> alarm.message())
                    .filter(message -> message != null && !message.isBlank())
                    .findFirst()
                    .ifPresent(message -> evidence.add("Thông điệp đầu tiên: " + message));
        }
        return new RuleHypothesis(
                0,
                40,
                "Sự cố chưa phân loại được nguyên nhân gốc rễ",
                "Chưa phân loại",
                null,
                null,
                null,
                null,
                null,
                null,
                "Không có quy tắc suy luận nào khớp với bằng chứng hiện có",
                null,
                null,
                evidence,
                List.of()
        );
    }

    private boolean nodeInGraph(InvestigationContext context, String deviceId) {
        if (context == null || context.epicenterTopology() == null
                || context.epicenterTopology().nodes() == null || deviceId == null) {
            return false;
        }
        return context.epicenterTopology().nodes().stream().anyMatch(node -> deviceId.equals(node.id()));
    }

    private List<String> consultedRunbookTitles(InvestigationContext context) {
        return context.runbooks() != null
                ? context.runbooks().stream().map(TechnicalDocSnippet::title).toList()
                : List.of();
    }

    private String safePort(String port) {
        return port != null ? port : "<port>";
    }

    private String toJson(List<RuleHypothesis> hypotheses) {
        try {
            return JSON_MAPPER.writeValueAsString(hypotheses);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to serialize rule-based hypotheses", ex);
        }
    }

    private record RuleHypothesis(
        int rank,
        int matchScore,
        String title,
        String shortTitle,
        String targetType,
        String targetId,
        String sourceNode,
        String targetNode,
        String sourcePort,
        String targetPort,
        String confidenceRationale,
        String cliCommand,
        String verificationCmd,
        List<String> evidence,
        List<String> contradictingEvidence
    ) {
    }
}
