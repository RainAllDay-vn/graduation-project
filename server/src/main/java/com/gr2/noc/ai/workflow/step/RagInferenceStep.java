package com.gr2.noc.ai.workflow.step;

import com.gr2.noc.ai.dto.InvestigationContext;
import com.gr2.noc.ai.dto.RawInference;
import com.gr2.noc.incident.dto.get.AlarmDetails;
import com.gr2.noc.rag.dto.TechnicalDocSnippet;
import com.gr2.noc.telemetry.dto.get.DeviceTelemetrySnapshotDetails;
import com.gr2.noc.telemetry.dto.get.TelemetryMetricSeries;
import com.gr2.noc.telemetry.dto.get.TelemetryTimeseriesPointDetails;
import com.gr2.noc.topology.dto.get.DeviceSummary;
import com.gr2.noc.topology.dto.get.LinkSummary;
import com.gr2.noc.topology.dto.get.TopologyGraph;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * RAG inference: assembles the design §6 prompts (system role + anti-hallucination
 * rules, multi-source user context) and calls the LLM via Spring AI {@link ChatClient}.
 * The model must answer with the §6.2 JSON hypothesis array; the shared synthesis step
 * validates it. Failures propagate to the workflow's failure hook (fail-loud).
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "app.ai.engine", havingValue = "rag")
public class RagInferenceStep implements InferenceStep {

    private static final String ENGINE_TYPE = "rag";
    private static final DateTimeFormatter TIMESTAMP_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'").withZone(ZoneOffset.UTC);
    private static final double CPU_TREND_SIGNIFICANT_RISE = 20.0;

    private static final String SYSTEM_PROMPT = """
            Bạn là Kỹ sư Trưởng L3 phụ trách Trung tâm Điều hành Mạng Viễn thông Quốc gia (NOC Lead Architect).
            Nhiệm vụ của bạn là xem xét toàn diện dữ liệu đa nguồn của sự cố mạng viễn thông được cung cấp, đối chiếu với Quy trình vận hành chuẩn (SOP) đính kèm để đưa ra Top 3 giả thuyết nguyên nhân gốc rễ (Root Cause Hypotheses) có cơ sở vững chắc nhất.

            CÁC NGUYÊN TẮC SUY LUẬN BẮT BUỘC:
            1. KHÔNG ẢO GIÁC: Mọi giả thuyết đưa ra PHẢI có ít nhất 1 bằng chứng xác thực (evidence) được trích xuất trực tiếp từ Alarms, Telemetry hoặc Topo cung cấp. Không được tự suy đoán phần cứng không tồn tại.
            2. PHẢN CHỨNG KHÁCH QUAN: Luôn tìm kiếm bằng chứng mâu thuẫn (contradictingEvidence) chứng minh tại sao một số nguyên nhân thông thường lại bị loại trừ (ví dụ: BGP flap nhưng CPU thấp chứng tỏ không phải do treo tiến trình CPU).
            3. ĐIỂM KHỚP CHÍNH XÁC (matchScore 0-100%):
               - >= 80%: Khi cả mã lỗi, công suất quang và topo đều chỉ thẳng vào một liên kết cụ thể.
               - 60-79%: Khi lỗi phần cứng hoặc cấu hình có khả năng cao nhưng cần kiểm tra thêm.
               - < 60%: Các nguyên nhân thứ yếu hoặc khả năng hiếm gặp.
            4. LỆNH THỰC THI (CLI COMMANDS): Cung cấp đúng cú pháp câu lệnh CLI của hãng thiết bị (Cisco IOS-XR/NX-OS, Nokia TiMOS, Juniper JunOS) để kỹ sư trực có thể gõ ngay trên màn hình Quick CLI.
            5. ĐỊNH DẠNG ĐẦU RA: Bắt buộc trả về duy nhất một mảng JSON hợp lệ, không giải thích dài dòng ngoài JSON.
            """;

    private static final String USER_PROMPT_TEMPLATE = """
            === 1. THÔNG TIN SỰ CỐ ===
            Mã sự cố: {incidentId}
            Tiêu đề: {title}
            Mức độ nghiêm trọng: {severity}
            Thiết bị tâm chấn: {primaryDeviceId}
            Thời điểm bắt đầu: {openedAt}

            === 2. DANH SÁCH CẢNH BÁO ĐANG KÍCH HOẠT (ALARMS) ===
            {alarmsFormattedList}

            === 3. SỐ LIỆU ĐO KIỂM HIỆU NĂNG (TELEMETRY) ===
            {telemetrySection}

            === 4. BẢN ĐỒ TOPO LÂN CẬN (1-HOP NEIGHBORS & LINKS) ===
            {topologySection}

            === 5. QUY TRÌNH VẬN HÀNH CHUẨN ĐỐI CHIẾU (SOP RUNBOOKS TỪ RAG) ===
            {runbooksSection}

            Dựa vào các dữ liệu trên, hãy phân tích logic và xuất ra Top 3 giả thuyết nguyên nhân gốc rễ theo đúng JSON Schema sau:
            [
              {
                "rank": 1,
                "matchScore": 88,
                "title": "Tên chi tiết giả thuyết",
                "shortTitle": "Tên ngắn gọn hiển thị card",
                "targetType": "EDGE hoặc NODE",
                "targetId": "ID liên kết hoặc ID node",
                "sourceNode": "Node nguồn",
                "targetNode": "Node đích",
                "sourcePort": "Cổng nguồn",
                "targetPort": "Cổng đích",
                "confidenceRationale": "Lập luận cơ sở chấm điểm",
                "cliCommand": "Lệnh kiểm tra nhanh CLI",
                "verificationCmd": "Lệnh xác minh chuyên sâu",
                "evidence": ["Bằng chứng 1", "Bằng chứng 2"],
                "contradictingEvidence": ["Bằng chứng mâu thuẫn 1"]
              }
            ]
            """;

    private final ChatClient chatClient;

    public RagInferenceStep(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @Override
    public RawInference infer(InvestigationContext context) {
        log.info("Calling LLM for incident {} with {} runbook(s)",
                context.incident().id(), context.runbooks() != null ? context.runbooks().size() : 0);
        String rawContent = chatClient.prompt()
                .system(SYSTEM_PROMPT)
                .user(buildUserPrompt(context))
                .call()
                .content();
        return RawInference.builder()
                .context(context)
                .rawContent(rawContent)
                .engineType(ENGINE_TYPE)
                .consultedRunbooks(consultedRunbookTitles(context))
                .build();
    }

    private String buildUserPrompt(InvestigationContext context) {
        return USER_PROMPT_TEMPLATE
                .replace("{incidentId}", context.incident().id())
                .replace("{title}", safe(context.incident().title()))
                .replace("{severity}", safe(context.incident().severity()))
                .replace("{primaryDeviceId}", safe(context.incident().primaryDeviceId()))
                .replace("{openedAt}", formatInstant(context.incident().openedAt()))
                .replace("{alarmsFormattedList}", formatAlarms(context.alarms()))
                .replace("{telemetrySection}", formatTelemetry(context))
                .replace("{topologySection}", formatTopology(context.epicenterTopology()))
                .replace("{runbooksSection}", formatRunbooks(context.runbooks()));
    }

    private String formatAlarms(List<AlarmDetails> alarms) {
        if (alarms == null || alarms.isEmpty()) {
            return "(không có cảnh báo)";
        }
        return alarms.stream()
                .map(alarm -> "- [%s] %s: %s (%s)".formatted(
                        safe(alarm.severity()),
                        safe(alarm.faultCode()),
                        safe(alarm.message()),
                        formatInstant(alarm.timestamp())))
                .collect(Collectors.joining("\n"));
    }

    private String formatTelemetry(InvestigationContext context) {
        DeviceTelemetrySnapshotDetails snapshot = context.telemetrySnapshot();
        if (snapshot == null) {
            return "(không có dữ liệu telemetry gần nhất)";
        }
        return "- Trạng thái hoạt động: %s\n- Tải hệ thống: %s%% | CPU: %s%% | RAM: %s%% | Nhiệt độ: %s°C\n"
                .formatted(
                        safe(snapshot.operStatus()),
                        formatNumber(snapshot.loadPercentage()),
                        formatNumber(snapshot.cpuPercent()),
                        formatNumber(snapshot.memoryPercent()),
                        formatNumber(snapshot.temperatureCelsius()))
                + "- Tuyến định tuyến học được: %s / Sử dụng: %s\n".formatted(
                        safe(snapshot.routesLearned()), safe(snapshot.routesUsed()))
                + "- Xu hướng CPU 1 giờ qua: %s".formatted(cpuTrendSummary(context.cpuTimeseries()));
    }

    private String cpuTrendSummary(TelemetryMetricSeries cpuTimeseries) {
        List<TelemetryTimeseriesPointDetails> points = cpuTimeseries != null && cpuTimeseries.points() != null
                ? cpuTimeseries.points()
                : List.of();
        if (points.size() < 2) {
            return "không đủ dữ liệu";
        }
        double first = points.get(0).value() != null ? points.get(0).value() : 0.0;
        double last = points.get(points.size() - 1).value() != null ? points.get(points.size() - 1).value() : 0.0;
        double delta = last - first;
        if (delta >= CPU_TREND_SIGNIFICANT_RISE) {
            return "tăng mạnh từ %.1f%% lên %.1f%%".formatted(first, last);
        }
        if (delta <= -CPU_TREND_SIGNIFICANT_RISE) {
            return "giảm từ %.1f%% xuống %.1f%%".formatted(first, last);
        }
        return "tương đối ổn định (%.1f%% → %.1f%%)".formatted(first, last);
    }

    private String formatTopology(TopologyGraph topology) {
        if (topology == null) {
            return "(không có dữ liệu topo lân cận)";
        }
        String nodes = topology.nodes() == null || topology.nodes().isEmpty()
                ? "(không có node lân cận)"
                : topology.nodes().stream()
                        .map(this::formatNode)
                        .collect(Collectors.joining("\n"));
        String links = topology.links() == null || topology.links().isEmpty()
                ? "(không có liên kết lân cận)"
                : topology.links().stream()
                        .map(this::formatLink)
                        .collect(Collectors.joining("\n"));
        return "Node:\n" + nodes + "\nLiên kết:\n" + links;
    }

    private String formatNode(DeviceSummary node) {
        return "- NODE %s (%s, %s)".formatted(node.id(), safe(node.name()), safe(node.model()));
    }

    private String formatLink(LinkSummary link) {
        return "- LINK %s: %s -> %s [%s, %s] (RX %s dBm, TX %s dBm, tải %s%%)".formatted(
                link.linkId(),
                link.sourceDeviceId(),
                link.targetDeviceId(),
                safe(link.operStatus()),
                link.capacityGbps() != null ? link.capacityGbps() + " Gbps" : "không rõ băng thông",
                formatNumber(link.rxPowerDbm()),
                formatNumber(link.txPowerDbm()),
                formatNumber(link.utilizationPercent()));
    }

    private String formatRunbooks(List<TechnicalDocSnippet> runbooks) {
        if (runbooks == null || runbooks.isEmpty()) {
            return "(không có SOP nào khớp bối cảnh này)";
        }
        return runbooks.stream()
                .map(snippet -> "### %s (độ tương đồng %.2f)\n%s".formatted(
                        safe(snippet.title()),
                        snippet.similarityScore() != null ? snippet.similarityScore() : 0.0,
                        safe(snippet.content())))
                .collect(Collectors.joining("\n\n"));
    }

    private List<String> consultedRunbookTitles(InvestigationContext context) {
        return context.runbooks() != null
                ? context.runbooks().stream().map(TechnicalDocSnippet::title).toList()
                : List.of();
    }

    private String formatInstant(Instant instant) {
        return instant != null ? TIMESTAMP_FORMAT.format(instant) : "không rõ";
    }

    private String formatNumber(Double value) {
        return value != null ? "%.1f".formatted(value) : "n/a";
    }

    private String safe(Object value) {
        return value != null ? String.valueOf(value) : "không rõ";
    }
}
