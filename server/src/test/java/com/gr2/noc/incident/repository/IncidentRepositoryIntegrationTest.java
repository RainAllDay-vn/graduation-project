package com.gr2.noc.incident.repository;

import com.gr2.noc.hypothesis.enums.HypothesisStatus;
import com.gr2.noc.hypothesis.model.Hypothesis;
import com.gr2.noc.hypothesis.repository.HypothesisRepository;
import com.gr2.noc.incident.enums.AlarmType;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Alarm;
import com.gr2.noc.incident.model.Incident;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class IncidentRepositoryIntegrationTest {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private AlarmRepository alarmRepository;

    @Autowired
    private HypothesisRepository hypothesisRepository;

    @Test
    @DisplayName("Should persist Incident with associated Alarms and Hypotheses")
    void shouldPersistIncidentWithAlarmsAndHypotheses() {
        Incident incident = Incident.builder()
                .id("INC-2026-0915")
                .title("Suy hao tín hiệu và BGP flapping")
                .description("Cảnh báo quang học và mất liên kết trên SW-HN-02")
                .severity(Severity.CRITICAL)
                .status(IncidentStatus.INVESTIGATING)
                .region("Hà Nội")
                .primaryDeviceId("SW-HN-02")
                .openedAt(Instant.now())
                .build();

        Alarm alarm1 = Alarm.builder()
                .id("ALM-2035")
                .deviceId("SW-HN-02")
                .timestamp(Instant.now().minus(5, ChronoUnit.MINUTES))
                .alarmType(AlarmType.FAULT_CODE)
                .faultCode("OPTICS_TEMP_HIGH")
                .severity(Severity.CRITICAL)
                .message("Module quang vượt ngưỡng nhiệt độ an toàn")
                .isCurrentIncident(true)
                .build();

        Alarm alarm2 = Alarm.builder()
                .id("ALM-2036")
                .deviceId("SW-HN-02")
                .timestamp(Instant.now().minus(3, ChronoUnit.MINUTES))
                .alarmType(AlarmType.RULE_BASED)
                .faultCode("BGP_FLAP")
                .severity(Severity.WARNING)
                .message("BGP neighbor 10.0.0.1 đã flap 3 lần trong 10 phút")
                .isCurrentIncident(true)
                .build();

        incident.addAlarm(alarm1);
        incident.addAlarm(alarm2);

        Hypothesis hypothesis = Hypothesis.builder()
                .rank(1)
                .matchScore(88)
                .title("Suy hao tín hiệu cáp quang CORE-02 ↔ AGG-02")
                .targetType("EDGE")
                .targetId("CORE-02 ↔ AGG-02")
                .sourceNode("CORE-02")
                .targetNode("AGG-02")
                .confidenceRationale("RX power thấp kết hợp nhiệt độ module quang cao bất thường")
                .status(HypothesisStatus.UNDER_CONSIDERATION)
                .evidence(List.of("RX power -24.2 dBm", "CRC errors tăng đột biến"))
                .contradictingEvidence(List.of("Traffic tải chỉ 34%"))
                .build();

        incident.addHypothesis(hypothesis);

        Incident saved = incidentRepository.save(incident);
        incidentRepository.flush();

        assertThat(saved.getId()).isEqualTo("INC-2026-0915");
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getAlarms()).hasSize(2);
        assertThat(saved.getHypotheses()).hasSize(1);

        List<Alarm> alarms = alarmRepository.findByIncidentIdOrderByTimestampDesc("INC-2026-0915");
        assertThat(alarms).hasSize(2);
        assertThat(alarms).extracting(Alarm::getDeviceId).containsOnly("SW-HN-02");

        List<Hypothesis> hypotheses = hypothesisRepository.findByIncidentIdOrderByRankAsc("INC-2026-0915");
        assertThat(hypotheses).hasSize(1);
        assertThat(hypotheses.get(0).getTitle()).isEqualTo("Suy hao tín hiệu cáp quang CORE-02 ↔ AGG-02");
        assertThat(hypotheses.get(0).getEvidence()).contains("RX power -24.2 dBm");
    }
}
