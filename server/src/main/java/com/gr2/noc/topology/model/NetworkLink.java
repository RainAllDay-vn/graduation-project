package com.gr2.noc.topology.model;

import com.gr2.noc.topology.enums.LinkType;
import lombok.*;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

/**
 * Represents a directed network connection (optical fiber or IP routing adjacency)
 * between two network devices in the topology graph.
 */
@RelationshipProperties
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NetworkLink {

    @RelationshipId
    private Long id;

    @Property("link_id")
    private String linkId;

    @Property("source_port")
    private String sourcePort;

    @Property("target_port")
    private String targetPort;

    @Property("link_type")
    @Builder.Default
    private LinkType linkType = LinkType.PHYSICAL_FIBER;

    @Property("capacity_gbps")
    @Builder.Default
    private Integer capacityGbps = 100;

    @Property("oper_status")
    @Builder.Default
    private String operStatus = "UP";

    @Property("rx_power_dbm")
    private Double rxPowerDbm;

    @Property("tx_power_dbm")
    private Double txPowerDbm;

    @Property("utilization_percent")
    @Builder.Default
    private Double utilizationPercent = 0.0;

    @Property("is_backup")
    @Builder.Default
    private Boolean isBackup = false;

    @TargetNode
    private NetworkDevice targetDevice;
}
