package com.gr2.noc.hypothesis.config;

import com.gr2.noc.hypothesis.enums.HypothesisStatus;
import com.gr2.noc.hypothesis.model.Hypothesis;
import com.gr2.noc.hypothesis.repository.HypothesisRepository;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Initializes realistic AI-generated root cause hypotheses on application startup (dev profile only).
 * Seeds hypotheses for incident INC-2026-0915 as depicted in Section 4.3 and 5.4-5.6 of Stylebook.
 */
@Component
@Profile("dev")
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class HypothesisDataInitializer implements CommandLineRunner {

    private final HypothesisRepository hypothesisRepository;
    private final IncidentRepository incidentRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (hypothesisRepository.count() > 0) {
            log.info("Hypothesis seed data already exists ({} records). Skipping initialization.", hypothesisRepository.count());
            return;
        }

        Incident incident = incidentRepository.findById("INC-2026-0915").orElse(null);
        if (incident == null) {
            log.warn("Incident INC-2026-0915 not found. Skipping hypothesis data seeding.");
            return;
        }

        log.info("Seeding initial root cause hypotheses for incident INC-2026-0915...");

        Instant now = Instant.now();

        // 1. Rank 1: Optical signal degradation (Primary root cause candidate - 88% match score)
        Hypothesis hypo1 = Hypothesis.builder()
                .incident(incident)
                .rank(1)
                .matchScore(88)
                .title("Suy hao tín hiệu cáp quang CORE-02 ↔ AGG-02")
                .shortTitle("Suy hao tín hiệu cáp quang")
                .targetType("EDGE")
                .targetId("CORE-02 ↔ AGG-02")
                .sourceNode("CORE-02")
                .targetNode("AGG-02")
                .sourcePort("HundredGigE0/0/1")
                .targetPort("HundredGigE0/0/1")
                .confidenceRationale("Mức công suất RX quang -24.2 dBm trên cổng HundredGigE0/0/1 nằm dưới ngưỡng an toàn (-22.0 dBm). Kết hợp với cảnh báo BGP flap 3 lần trong 10 phút, tương thích 88% với mô hình suy hao đường truyền quang học.")
                .status(HypothesisStatus.UNDER_CONSIDERATION)
                .cliCommand("show interfaces transceiver HundredGigE0/0/1 detail")
                .verificationCmd("show ip bgp summary")
                .evidence(new ArrayList<>(List.of(
                        "Công suất RX quang đo được -24.2 dBm (ngưỡng cảnh báo -22.0 dBm, ngưỡng lỗi -24.0 dBm)",
                        "BGP neighbor 10.100.1.2 chuyển trạng thái Down/Up 3 lần liên tiếp trong 10 phút",
                        "Thời gian bắt đầu suy hao trùng khớp với thời điểm nhiệt độ module quang tăng vọt lên 78°C"
                )))
                .contradictingEvidence(new ArrayList<>(List.of(
                        "Chỉ số suy hao TX ở phía đầu phát CORE-02 vẫn duy trì bình thường (+1.2 dBm)"
                )))
                .createdAt(now.minus(20, ChronoUnit.MINUTES))
                .build();

        // 2. Rank 2: Hardware optical transceiver defect / overheating (74% match score)
        Hypothesis hypo2 = Hypothesis.builder()
                .incident(incident)
                .rank(2)
                .matchScore(74)
                .title("Lỗi giao diện phần cứng / Thẻ module quang SFP+ bị hỏng")
                .shortTitle("Thẻ module quang lỗi")
                .targetType("NODE")
                .targetId("SW-HN-02")
                .sourceNode("SW-HN-02")
                .sourcePort("HundredGigE0/0/1")
                .confidenceRationale("Nhiệt độ module quang cổng HundredGigE0/0/1 vượt ngưỡng cảnh báo (78°C). Có khả năng transceiver đang bị quá nhiệt gây trôi tần số laser quang.")
                .status(HypothesisStatus.UNDER_CONSIDERATION)
                .cliCommand("show environment temperature")
                .verificationCmd("show inventory")
                .evidence(new ArrayList<>(List.of(
                        "Cảnh báo FAULT_CODE OPTICS_TEMP_HIGH kích hoạt lúc 18 phút trước",
                        "Transceiver module ghi nhận dòng điện bias laser tăng 15%"
                )))
                .contradictingEvidence(new ArrayList<>(List.of(
                        "Quạt tản nhiệt khung máy hoạt động bình thường ở tốc độ 7200 RPM"
                )))
                .createdAt(now.minus(19, ChronoUnit.MINUTES))
                .build();

        // 3. Rank 3: Control plane CPU congestion (45% match score)
        Hypothesis hypo3 = Hypothesis.builder()
                .incident(incident)
                .rank(3)
                .matchScore(45)
                .title("Quá tải CPU điều khiển dẫn đến BGP Keepalive Timeout")
                .shortTitle("BGP Keepalive Timeout do CPU")
                .targetType("NODE")
                .targetId("SW-HN-02")
                .sourceNode("SW-HN-02")
                .confidenceRationale("BGP flapping có thể do CPU control plane bị chiếm dụng không phản hồi kịp gói tin BGP Keepalive.")
                .status(HypothesisStatus.UNDER_CONSIDERATION)
                .cliCommand("show processes cpu sorted")
                .verificationCmd("show ip bgp neighbors 10.100.1.2")
                .evidence(new ArrayList<>(List.of(
                        "BGP session bị reset do Hold Timer Expired"
                )))
                .contradictingEvidence(new ArrayList<>(List.of(
                        "Tải CPU hiện tại của SW-HN-02 chỉ ở mức 24.5%",
                        "Các giao thức định tuyến khác (OSPF) vẫn duy trì trạng thái Full"
                )))
                .createdAt(now.minus(18, ChronoUnit.MINUTES))
                .build();

        hypothesisRepository.saveAll(List.of(hypo1, hypo2, hypo3));
        log.info("Successfully seeded 3 root cause hypotheses for incident INC-2026-0915.");
    }
}
