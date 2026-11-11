package com.gr2.noc.incident.config;

import com.gr2.noc.incident.enums.AlarmType;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import com.gr2.noc.incident.model.Alarm;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Initializes realistic sample incidents and alarms on application startup (dev profile only).
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class IncidentDataInitializer implements CommandLineRunner {

    private final IncidentRepository incidentRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (incidentRepository.count() > 0) {
            log.info("Incident seed data already exists ({} records). Skipping initialization.", incidentRepository.count());
            return;
        }

        log.info("Seeding initial NOC incidents and alarms data...");

        Instant now = Instant.now();

        // 1. Critical ongoing incident: Optical degradation & BGP flap on SW-HN-02
        Incident incident1 = Incident.builder()
                .id("INC-2026-0915")
                .title("Suy hao quang học và BGP Flapping")
                .description("Ghi nhận suy hao tín hiệu RX quang trên cổng HundredGigE0/0/1 liên kết SW-HN-02 với CORE-02, dẫn đến BGP neighbor session chuyển trạng thái chập chờn.")
                .status(IncidentStatus.INVESTIGATING)
                .severity(Severity.CRITICAL)
                .region("Miền Bắc - Hà Nội")
                .primaryDeviceId("SW-HN-02")
                .openedAt(now.minus(25, ChronoUnit.MINUTES))
                .build();

        Alarm alarm1 = Alarm.builder()
                .id("ALM-2035")
                .deviceId("SW-HN-02")
                .timestamp(now.minus(18, ChronoUnit.MINUTES))
                .alarmType(AlarmType.FAULT_CODE)
                .faultCode("OPTICS_TEMP_HIGH")
                .severity(Severity.CRITICAL)
                .message("Nhiệt độ module quang cổng HundredGigE0/0/1 vượt ngưỡng 78°C (ngưỡng 75°C)")
                .isCurrentIncident(true)
                .build();

        Alarm alarm2 = Alarm.builder()
                .id("ALM-2036")
                .deviceId("SW-HN-02")
                .timestamp(now.minus(12, ChronoUnit.MINUTES))
                .alarmType(AlarmType.FAULT_CODE)
                .faultCode("OPTICS_RX_POWER_LOW")
                .severity(Severity.CRITICAL)
                .message("Cường độ tín hiệu RX quang giảm xuống -24.2 dBm (ngưỡng an toàn -22.0 dBm)")
                .isCurrentIncident(true)
                .build();

        Alarm alarm3 = Alarm.builder()
                .id("ALM-2037")
                .deviceId("SW-HN-02")
                .timestamp(now.minus(5, ChronoUnit.MINUTES))
                .alarmType(AlarmType.RULE_BASED)
                .faultCode("BGP_FLAP")
                .severity(Severity.WARNING)
                .message("BGP session với peer 10.100.1.2 (CORE-02) đã flap 3 lần trong 10 phút gần nhất")
                .isCurrentIncident(true)
                .build();

        incident1.addAlarm(alarm1);
        incident1.addAlarm(alarm2);
        incident1.addAlarm(alarm3);

        // 2. Open error incident: Uplink bandwidth congestion in Da Nang
        Incident incident2 = Incident.builder()
                .id("INC-2026-0916")
                .title("Nghẽn băng thông uplink Core Đà Nẵng")
                .description("Lưu lượng mạng đột biến vượt quá 92% dung lượng cổng uplink giữa CORE-DN-01 và AGG-DN-01.")
                .status(IncidentStatus.OPEN)
                .severity(Severity.ERROR)
                .region("Miền Trung - Đà Nẵng")
                .primaryDeviceId("CORE-DN-01")
                .openedAt(now.minus(45, ChronoUnit.MINUTES))
                .build();

        Alarm alarm4 = Alarm.builder()
                .id("ALM-2040")
                .deviceId("CORE-DN-01")
                .timestamp(now.minus(40, ChronoUnit.MINUTES))
                .alarmType(AlarmType.FAULT_CODE)
                .faultCode("INTERFACE_UTIL_HIGH")
                .severity(Severity.ERROR)
                .message("Cổng HundredGigE0/1/0 đạt mức tải 94.2% trong 15 phút liên tục")
                .isCurrentIncident(true)
                .build();

        incident2.addAlarm(alarm4);

        // 3. Resolved warning incident: Redundant PSU lost in HCMC
        Incident incident3 = Incident.builder()
                .id("INC-2026-0910")
                .title("Mất nguồn thứ cấp PSU 2 tại POP Sài Gòn")
                .description("Mất nguồn điện lưới AC thứ cấp trên thiết bị AGG-HCM-01, hệ thống đã chuyển tải an toàn sang PSU 1 dự phòng.")
                .status(IncidentStatus.RESOLVED)
                .severity(Severity.WARNING)
                .region("Miền Nam - TP. Hồ Chí Minh")
                .primaryDeviceId("AGG-HCM-01")
                .openedAt(now.minus(2, ChronoUnit.DAYS))
                .resolvedAt(now.minus(1, ChronoUnit.DAYS))
                .build();

        Alarm alarm5 = Alarm.builder()
                .id("ALM-2010")
                .deviceId("AGG-HCM-01")
                .timestamp(now.minus(2, ChronoUnit.DAYS))
                .alarmType(AlarmType.FAULT_CODE)
                .faultCode("PSU_INPUT_LOST")
                .severity(Severity.WARNING)
                .message("PSU 2 input AC voltage drop detected, running on redundant PSU 1")
                .isCurrentIncident(true)
                .build();

        incident3.addAlarm(alarm5);

        incidentRepository.saveAll(List.of(incident1, incident2, incident3));
        log.info("Successfully seeded 3 sample NOC incidents with associated alarms.");
    }
}
