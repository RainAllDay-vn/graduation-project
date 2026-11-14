package com.gr2.noc.service.config;

import com.gr2.noc.service.dto.get.NetworkServiceDetails;
import com.gr2.noc.service.dto.get.NetworkServiceSummary;
import com.gr2.noc.service.dto.get.ServiceImpactReport;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.service.NetworkServiceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
@DirtiesContext
class ServiceDataInitializerIntegrationTest {

    @Autowired
    private NetworkServiceService networkServiceService;

    @Test
    @DisplayName("Should seed telecom L3 services inventory when dev profile is active")
    void shouldSeedServicesWhenDevProfileActive() {
        List<NetworkServiceSummary> services = networkServiceService.getServices(null, null, null, null);
        assertThat(services).hasSizeGreaterThanOrEqualTo(12);

        // Incident path service marked DEGRADED and wired to the degraded device SW-HN-02
        NetworkServiceDetails transit = networkServiceService.getServiceById("SVC-INT-TRANSIT-HN");
        assertThat(transit.status()).isEqualTo(ServiceStatus.DEGRADED);
        assertThat(transit.dependentDevices())
                .extracting("id")
                .contains("IGW-01", "CORE-01", "CORE-02", "SW-HN-02");

        NetworkServiceDetails vpn = networkServiceService.getServiceById("SVC-VPN-MPLS-HN");
        assertThat(vpn.status()).isEqualTo(ServiceStatus.DEGRADED);
        assertThat(vpn.dependentDevices()).extracting("id").contains("AGG-02");

        // A service on the same degraded device but still flagged OPERATIONAL
        NetworkServiceDetails voip = networkServiceService.getServiceById("SVC-VOIP-HN");
        assertThat(voip.status()).isEqualTo(ServiceStatus.OPERATIONAL);
        assertThat(voip.dependentDevices()).extracting("id").contains("SW-HN-02");

        // Impact report reveals the degraded dependency on the incident path
        ServiceImpactReport impact = networkServiceService.getServiceImpact("SVC-INT-TRANSIT-HN");
        assertThat(impact.degradedDevices()).isGreaterThanOrEqualTo(1);
        assertThat(impact.affectedDevices()).extracting("id").contains("SW-HN-02");
    }
}
