package com.gr2.noc.topology.model;

import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.enums.DeviceStatus;
import lombok.*;
import org.springframework.data.annotation.Version;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a network infrastructure node (Router, Switch, Gateway)
 * in the stratified telecom topology graph.
 */
@Node("NetworkDevice")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NetworkDevice {

    @Id
    private String id; // e.g. "SW-HN-02", "CORE-02", "AGG-02"

    @Version
    private Long version;

    @Property("name")
    private String name;

    @Property("layer")
    private DeviceLayer layer;

    @Property("region")
    private String region; // e.g. "Miền Bắc - Hà Nội", "Miền Trung - Đà Nẵng", "Miền Nam - TP. Hồ Chí Minh"

    @Property("site")
    private String site; // e.g. "POP-HN-01", "DC-HN-02"

    @Property("ip_address")
    private String ipAddress; // Management / Loopback IP e.g. "10.100.1.2"

    @Property("model")
    private String model; // e.g. "Cisco ASR 9904", "Nokia 7750 SR"

    @Property("status")
    @Builder.Default
    private DeviceStatus status = DeviceStatus.ACTIVE;

    @Property("access_device_count")
    @Builder.Default
    private Integer accessDeviceCount = 0; // Number of access switches summarized under this node

    @Property("access_error_count")
    @Builder.Default
    private Integer accessErrorCount = 0; // Number of failed access switches

    @Relationship(type = "CONNECTED_TO", direction = Relationship.Direction.OUTGOING)
    @Builder.Default
    private List<NetworkLink> links = new ArrayList<>();

    public void addLink(NetworkLink link) {
        if (this.links == null) {
            this.links = new ArrayList<>();
        }
        if (link != null && link.getLinkId() != null) {
            this.links.removeIf(existing -> link.getLinkId().equals(existing.getLinkId()));
        }
        if (link != null) {
            this.links.add(link);
        }
    }

    public void setLinks(List<NetworkLink> links) {
        this.links = links != null ? new ArrayList<>(links) : new ArrayList<>();
    }
}
