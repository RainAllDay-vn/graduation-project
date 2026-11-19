package com.gr2.noc.topology.config;

import com.gr2.noc.topology.dto.get.DeviceDetails;
import com.gr2.noc.topology.dto.get.LinkSummary;
import com.gr2.noc.topology.dto.get.TopologyGraph;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.service.TopologyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
@DirtiesContext
class TopologyDataInitializerIntegrationTest {

    @Autowired
    private TopologyService topologyService;

    @Test
    @DisplayName("Should seed realistic telecom topology graph when dev profile is active")
    void shouldSeedTopologyWhenDevProfileActive() {
        TopologyGraph graph = topologyService.getFullGraph();
        assertThat(graph.nodes()).hasSizeGreaterThanOrEqualTo(12);
        assertThat(graph.links()).hasSizeGreaterThanOrEqualTo(8);

        // Verify primary incident device
        DeviceDetails swHn02 = topologyService.getDeviceById("SW-HN-02");
        assertThat(swHn02).isNotNull();
        assertThat(swHn02.status()).isEqualTo(DeviceStatus.DEGRADED);
        assertThat(swHn02.accessDeviceCount()).isEqualTo(14);
        assertThat(swHn02.links()).isNotEmpty();

        // Verify optical fault link from incident INC-2026-0915
        LinkSummary opticalFaultLink = swHn02.links().stream()
                .filter(l -> "LINK-SW-HN-02-CORE-02".equals(l.linkId()))
                .findFirst()
                .orElse(null);

        assertThat(opticalFaultLink).isNotNull();
        assertThat(opticalFaultLink.rxPowerDbm()).isEqualTo(-24.2);
        assertThat(opticalFaultLink.operStatus()).isEqualTo("DEGRADED");
        assertThat(opticalFaultLink.targetDeviceId()).isEqualTo("CORE-02");
    }
}
