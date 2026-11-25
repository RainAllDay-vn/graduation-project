package com.gr2.noc.service.model;

import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.topology.model.NetworkDevice;
import lombok.*;
import org.springframework.data.annotation.Version;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a telecom L3 service (e.g. Internet transit, MPLS VPN, VoIP)
 * delivered over the network topology. A service depends on one or more
 * network devices; failures along those devices propagate to the service.
 */
@Node("NetworkService")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NetworkService {

    @Id
    private String id; // e.g. "SVC-INTERNET-HN-01"

    @Version
    private Long version;

    @Property("name")
    private String name;

    @Property("description")
    private String description;

    @Property("service_type")
    @Builder.Default
    private ServiceType type = ServiceType.INTERNET_TRANSIT;

    @Property("region")
    private String region; // e.g. "Miền Bắc - Hà Nội"

    @Property("status")
    @Builder.Default
    private ServiceStatus status = ServiceStatus.OPERATIONAL;

    @Property("subscriber_count")
    @Builder.Default
    private Integer subscriberCount = 0;

    @Relationship(type = "DEPENDS_ON", direction = Relationship.Direction.OUTGOING)
    @Builder.Default
    private List<NetworkDevice> dependentDevices = new ArrayList<>();

    public void addDependentDevice(NetworkDevice device) {
        if (this.dependentDevices == null) {
            this.dependentDevices = new ArrayList<>();
        }
        if (device != null && device.getId() != null) {
            this.dependentDevices.removeIf(existing -> device.getId().equals(existing.getId()));
        }
        if (device != null) {
            this.dependentDevices.add(device);
        }
    }

    public void setDependentDevices(List<NetworkDevice> devices) {
        this.dependentDevices = devices != null ? new ArrayList<>(devices) : new ArrayList<>();
    }
}
