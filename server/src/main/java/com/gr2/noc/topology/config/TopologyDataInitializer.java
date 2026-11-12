package com.gr2.noc.topology.config;

import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.dto.create.CreateLinkRequest;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.enums.LinkType;
import com.gr2.noc.topology.service.TopologyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Seeds initial telecom topology network on application startup (dev profile only).
 * Builds nodes and links around primary incident devices (SW-HN-02, CORE-02, AGG-02)
 * as specified in Section 4.3 and Topology Design Guide.
 */
@Component
@Profile("dev")
@Order(3)
@RequiredArgsConstructor
@Slf4j
public class TopologyDataInitializer implements CommandLineRunner {

    private final TopologyService topologyService;

    @Override
    public void run(String... args) {
        try {
            topologyService.getDeviceById("SW-HN-02");
            log.info("Topology seed data already exists. Skipping initialization.");
            return;
        } catch (Exception ignored) {
            // Devices not seeded yet, proceed
        }

        log.info("Seeding realistic NOC topology devices and optical/IP links...");

        // 1. Tier 1: International Peering & Gateways
        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("PEER-01")
                .name("VNIX Peering Router 01")
                .layer(DeviceLayer.PEER)
                .region("Miền Bắc - Hà Nội")
                .site("POP-HN-VNIX")
                .ipAddress("10.250.0.1")
                .model("Cisco ASR 9904")
                .status(DeviceStatus.ACTIVE)
                .build());

        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("IGW-01")
                .name("International Gateway 01")
                .layer(DeviceLayer.IGW)
                .region("Miền Bắc - Hà Nội")
                .site("POP-HN-01")
                .ipAddress("10.250.1.1")
                .model("Juniper PTX10008")
                .status(DeviceStatus.ACTIVE)
                .build());

        // 2. Tier 2: Provincial Core Backbone Routers
        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("CORE-01")
                .name("Core Router Hà Nội 01")
                .layer(DeviceLayer.CORE)
                .region("Miền Bắc - Hà Nội")
                .site("POP-HN-01")
                .ipAddress("10.100.0.1")
                .model("Cisco ASR 9904")
                .status(DeviceStatus.ACTIVE)
                .build());

        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("CORE-02")
                .name("Core Router Hà Nội 02")
                .layer(DeviceLayer.CORE)
                .region("Miền Bắc - Hà Nội")
                .site("POP-HN-02")
                .ipAddress("10.100.0.2")
                .model("Cisco ASR 9904")
                .status(DeviceStatus.ACTIVE)
                .build());

        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("CORE-DN-01")
                .name("Core Router Đà Nẵng 01")
                .layer(DeviceLayer.CORE)
                .region("Miền Trung - Đà Nẵng")
                .site("POP-DN-01")
                .ipAddress("10.100.2.1")
                .model("Cisco ASR 9904")
                .status(DeviceStatus.ACTIVE)
                .build());

        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("CORE-HCM-01")
                .name("Core Router Hồ Chí Minh 01")
                .layer(DeviceLayer.CORE)
                .region("Miền Nam - TP. Hồ Chí Minh")
                .site("POP-HCM-01")
                .ipAddress("10.100.3.1")
                .model("Cisco ASR 9904")
                .status(DeviceStatus.ACTIVE)
                .build());

        // 3. Tier 3: Edge Aggregation Routers
        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("SW-HN-02")
                .name("Aggregation Switch Hà Nội 02")
                .layer(DeviceLayer.AGGREGATION)
                .region("Miền Bắc - Hà Nội")
                .site("POP-HN-02")
                .ipAddress("10.100.1.2")
                .model("Cisco Nexus 9336C")
                .status(DeviceStatus.DEGRADED)
                .accessDeviceCount(14)
                .accessErrorCount(1)
                .build());

        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("AGG-01")
                .name("Aggregation Router Hà Nội 01")
                .layer(DeviceLayer.AGGREGATION)
                .region("Miền Bắc - Hà Nội")
                .site("POP-HN-01")
                .ipAddress("10.100.1.1")
                .model("Nokia 7750 SR")
                .status(DeviceStatus.ACTIVE)
                .accessDeviceCount(18)
                .accessErrorCount(0)
                .build());

        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("AGG-02")
                .name("Aggregation Router Hà Nội 02")
                .layer(DeviceLayer.AGGREGATION)
                .region("Miền Bắc - Hà Nội")
                .site("POP-HN-02")
                .ipAddress("10.100.1.3")
                .model("Nokia 7750 SR")
                .status(DeviceStatus.ACTIVE)
                .accessDeviceCount(12)
                .accessErrorCount(0)
                .build());

        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("AGG-DN-01")
                .name("Aggregation Router Đà Nẵng 01")
                .layer(DeviceLayer.AGGREGATION)
                .region("Miền Trung - Đà Nẵng")
                .site("POP-DN-01")
                .ipAddress("10.100.2.2")
                .model("Nokia 7750 SR")
                .status(DeviceStatus.ACTIVE)
                .accessDeviceCount(16)
                .accessErrorCount(0)
                .build());

        // 4. Tier 4: Metro Central Office Exchange Hubs
        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("EXCH-HN-01")
                .name("Metro Exchange Cầu Giấy")
                .layer(DeviceLayer.EXCHANGE)
                .region("Miền Bắc - Hà Nội")
                .site("EXCH-CG-01")
                .ipAddress("10.100.10.1")
                .model("Huawei NE40E")
                .status(DeviceStatus.ACTIVE)
                .accessDeviceCount(24)
                .accessErrorCount(0)
                .build());

        topologyService.createDevice(CreateDeviceRequest.builder()
                .id("EXCH-HN-02")
                .name("Metro Exchange Hoàn Kiếm")
                .layer(DeviceLayer.EXCHANGE)
                .region("Miền Bắc - Hà Nội")
                .site("EXCH-HK-01")
                .ipAddress("10.100.10.2")
                .model("Huawei NE40E")
                .status(DeviceStatus.ACTIVE)
                .accessDeviceCount(30)
                .accessErrorCount(0)
                .build());

        // 5. Establish Connections & Optical Links
        // Faulty optical link for incident INC-2026-0915
        topologyService.createLink(CreateLinkRequest.builder()
                .linkId("LINK-SW-HN-02-CORE-02")
                .sourceDeviceId("SW-HN-02")
                .targetDeviceId("CORE-02")
                .sourcePort("HundredGigE0/0/1")
                .targetPort("HundredGigE0/0/1")
                .linkType(LinkType.PHYSICAL_FIBER)
                .capacityGbps(100)
                .operStatus("DEGRADED")
                .rxPowerDbm(-24.2)
                .txPowerDbm(1.2)
                .utilizationPercent(78.5)
                .isBackup(false)
                .build());

        // Standby link for dual-homing
        topologyService.createLink(CreateLinkRequest.builder()
                .linkId("LINK-SW-HN-02-CORE-01")
                .sourceDeviceId("SW-HN-02")
                .targetDeviceId("CORE-01")
                .sourcePort("HundredGigE0/0/2")
                .targetPort("HundredGigE0/0/2")
                .linkType(LinkType.PHYSICAL_FIBER)
                .capacityGbps(100)
                .operStatus("UP")
                .rxPowerDbm(-12.5)
                .txPowerDbm(1.5)
                .utilizationPercent(15.0)
                .isBackup(true)
                .build());

        // Inter-Core Backbone link
        topologyService.createLink(CreateLinkRequest.builder()
                .linkId("LINK-CORE-01-CORE-02")
                .sourceDeviceId("CORE-01")
                .targetDeviceId("CORE-02")
                .sourcePort("HundredGigE1/0/1")
                .targetPort("HundredGigE1/0/1")
                .linkType(LinkType.PHYSICAL_FIBER)
                .capacityGbps(200)
                .operStatus("UP")
                .rxPowerDbm(-10.2)
                .txPowerDbm(2.0)
                .utilizationPercent(54.0)
                .isBackup(false)
                .build());

        // Core to Gateway links
        topologyService.createLink(CreateLinkRequest.builder()
                .linkId("LINK-CORE-01-IGW-01")
                .sourceDeviceId("CORE-01")
                .targetDeviceId("IGW-01")
                .sourcePort("HundredGigE2/0/1")
                .targetPort("HundredGigE0/0/1")
                .linkType(LinkType.PHYSICAL_FIBER)
                .capacityGbps(100)
                .operStatus("UP")
                .rxPowerDbm(-11.0)
                .txPowerDbm(1.8)
                .utilizationPercent(62.0)
                .isBackup(false)
                .build());

        topologyService.createLink(CreateLinkRequest.builder()
                .linkId("LINK-IGW-01-PEER-01")
                .sourceDeviceId("IGW-01")
                .targetDeviceId("PEER-01")
                .sourcePort("HundredGigE1/0/1")
                .targetPort("HundredGigE0/0/1")
                .linkType(LinkType.LOGICAL_IP)
                .capacityGbps(100)
                .operStatus("UP")
                .rxPowerDbm(-9.8)
                .txPowerDbm(2.2)
                .utilizationPercent(45.0)
                .isBackup(false)
                .build());

        // Core to Regional links
        topologyService.createLink(CreateLinkRequest.builder()
                .linkId("LINK-CORE-02-CORE-DN-01")
                .sourceDeviceId("CORE-02")
                .targetDeviceId("CORE-DN-01")
                .sourcePort("HundredGigE3/0/1")
                .targetPort("HundredGigE1/0/1")
                .linkType(LinkType.PHYSICAL_FIBER)
                .capacityGbps(100)
                .operStatus("UP")
                .rxPowerDbm(-14.1)
                .txPowerDbm(1.0)
                .utilizationPercent(41.2)
                .isBackup(false)
                .build());

        // Aggregation to Exchange links
        topologyService.createLink(CreateLinkRequest.builder()
                .linkId("LINK-SW-HN-02-EXCH-HN-01")
                .sourceDeviceId("SW-HN-02")
                .targetDeviceId("EXCH-HN-01")
                .sourcePort("TenGigE0/1/1")
                .targetPort("TenGigE0/0/1")
                .linkType(LinkType.PHYSICAL_FIBER)
                .capacityGbps(40)
                .operStatus("UP")
                .rxPowerDbm(-13.0)
                .txPowerDbm(0.5)
                .utilizationPercent(50.0)
                .isBackup(false)
                .build());

        topologyService.createLink(CreateLinkRequest.builder()
                .linkId("LINK-AGG-01-EXCH-HN-02")
                .sourceDeviceId("AGG-01")
                .targetDeviceId("EXCH-HN-02")
                .sourcePort("TenGigE0/1/1")
                .targetPort("TenGigE0/0/1")
                .linkType(LinkType.PHYSICAL_FIBER)
                .capacityGbps(40)
                .operStatus("UP")
                .rxPowerDbm(-12.8)
                .txPowerDbm(0.8)
                .utilizationPercent(38.0)
                .isBackup(false)
                .build());

        log.info("Successfully seeded 12 network devices and 8 interconnection links.");
    }
}
