package com.gr2.noc.topology;

import com.gr2.noc.topology.dto.create.CreateDeviceRequest;
import com.gr2.noc.topology.dto.create.CreateLinkRequest;
import com.gr2.noc.topology.dto.get.DeviceDetails;
import com.gr2.noc.topology.dto.get.LinkSummary;
import com.gr2.noc.topology.dto.update.UpdateDeviceStatusRequest;
import com.gr2.noc.topology.dto.update.UpdateLinkStatusRequest;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import com.gr2.noc.topology.service.TopologyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class TopologyServiceUpsertTest {

    @Autowired
    private TopologyService topologyService;

    @BeforeEach
    void setUp() {
        topologyService.clearAll();
    }

    @Test
    @DisplayName("Should upsert, update status, and remove devices with 404 on missing device")
    void shouldUpsertUpdateAndRemoveDevice() {
        DeviceDetails created = topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("DEV-U1")
                .name("Core 1")
                .layer(DeviceLayer.CORE)
                .region("North")
                .build());
        assertThat(created.status()).isEqualTo(DeviceStatus.ACTIVE);

        DeviceDetails updated = topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("DEV-U1")
                .name("Core 1 Renamed")
                .layer(DeviceLayer.CORE)
                .model("ASR 9904")
                .build());
        assertThat(updated.name()).isEqualTo("Core 1 Renamed");
        assertThat(updated.region()).isEqualTo("North");
        assertThat(updated.model()).isEqualTo("ASR 9904");

        DeviceDetails statusUpdated = topologyService.updateDeviceStatus("DEV-U1", UpdateDeviceStatusRequest.builder()
                .status(DeviceStatus.CRITICAL)
                .accessDeviceCount(8)
                .accessErrorCount(3)
                .build());
        assertThat(statusUpdated.status()).isEqualTo(DeviceStatus.CRITICAL);
        assertThat(statusUpdated.accessErrorCount()).isEqualTo(3);

        topologyService.removeDevice("DEV-U1", false);
        assertThat(topologyService.getDeviceById("DEV-U1").status()).isEqualTo(DeviceStatus.OFFLINE);

        topologyService.removeDevice("DEV-U1", true);
        assertThatThrownBy(() -> topologyService.getDeviceById("DEV-U1"))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        assertThatThrownBy(() -> topologyService.updateDeviceStatus("MISSING",
                UpdateDeviceStatusRequest.builder().status(DeviceStatus.ACTIVE).build()))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        assertThatThrownBy(() -> topologyService.removeDevice("MISSING", false))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("Should upsert, move, update status, and remove links with 404 on missing endpoints or link")
    void shouldUpsertMoveUpdateAndRemoveLink() {
        topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("SRC-1").name("Src 1").layer(DeviceLayer.CORE).build());
        topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("SRC-2").name("Src 2").layer(DeviceLayer.CORE).build());
        topologyService.upsertDevice(CreateDeviceRequest.builder()
                .id("TGT-1").name("Tgt 1").layer(DeviceLayer.AGGREGATION).build());

        assertThatThrownBy(() -> topologyService.upsertLink(CreateLinkRequest.builder()
                .linkId("LNK-MISSING-SRC")
                .sourceDeviceId("NO-SUCH-SRC")
                .targetDeviceId("TGT-1")
                .sourcePort("p1")
                .targetPort("p2")
                .build()))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        assertThatThrownBy(() -> topologyService.upsertLink(CreateLinkRequest.builder()
                .linkId("LNK-MISSING-TGT")
                .sourceDeviceId("SRC-1")
                .targetDeviceId("NO-SUCH-TGT")
                .sourcePort("p1")
                .targetPort("p2")
                .build()))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        topologyService.upsertLink(CreateLinkRequest.builder()
                .linkId("LNK-1")
                .sourceDeviceId("SRC-1")
                .targetDeviceId("TGT-1")
                .sourcePort("ge-0/0/1")
                .targetPort("ge-0/0/1")
                .build());
        LinkSummary moved = topologyService.upsertLink(CreateLinkRequest.builder()
                .linkId("LNK-1")
                .sourceDeviceId("SRC-2")
                .targetDeviceId("TGT-1")
                .sourcePort("et-0/0/1")
                .targetPort("et-0/0/1")
                .capacityGbps(400)
                .build());
        assertThat(moved.sourceDeviceId()).isEqualTo("SRC-2");
        assertThat(moved.capacityGbps()).isEqualTo(400);
        assertThat(topologyService.getLinks()).hasSize(1);

        LinkSummary updated = topologyService.updateLinkStatus("LNK-1", UpdateLinkStatusRequest.builder()
                .operStatus("DEGRADED")
                .utilizationPercent(76.5)
                .build());
        assertThat(updated.operStatus()).isEqualTo("DEGRADED");
        assertThat(updated.utilizationPercent()).isEqualTo(76.5);

        topologyService.removeLink("LNK-1", false);
        assertThat(topologyService.getLinks().get(0).operStatus()).isEqualTo("DOWN");

        topologyService.removeLink("LNK-1", true);
        assertThat(topologyService.getLinks()).isEmpty();

        assertThatThrownBy(() -> topologyService.updateLinkStatus("NO-SUCH-LINK",
                UpdateLinkStatusRequest.builder().operStatus("DOWN").build()))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);

        assertThatThrownBy(() -> topologyService.removeLink("NO-SUCH-LINK", true))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }
}
