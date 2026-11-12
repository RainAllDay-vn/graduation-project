package com.gr2.noc.topology.repository;

import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.model.NetworkDevice;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NetworkDeviceRepository extends Neo4jRepository<NetworkDevice, String> {

    List<NetworkDevice> findByLayer(DeviceLayer layer);

    List<NetworkDevice> findByRegion(String region);

    List<NetworkDevice> findByLayerAndRegion(DeviceLayer layer, String region);

    /**
     * Retrieve all devices along with their connected links.
     */
    @Query("MATCH (d:NetworkDevice) " +
           "OPTIONAL MATCH (d)-[r:CONNECTED_TO]->(t:NetworkDevice) " +
           "RETURN d, collect(r), collect(t)")
    List<NetworkDevice> findAllWithLinks();

    /**
     * Retrieve a specific device along with its connected links.
     */
    @Query("MATCH (d:NetworkDevice {id: $deviceId}) " +
           "OPTIONAL MATCH (d)-[r:CONNECTED_TO]->(t:NetworkDevice) " +
           "RETURN d, collect(r), collect(t)")
    Optional<NetworkDevice> findByIdWithLinks(String deviceId);

    /**
     * Retrieve 1-hop ego-network subgraph around a focus device.
     */
    @Query("MATCH (d:NetworkDevice {id: $deviceId}) " +
           "OPTIONAL MATCH (d)-[r:CONNECTED_TO]-(neighbor:NetworkDevice) " +
           "RETURN d, collect(r), collect(neighbor)")
    List<NetworkDevice> find1HopNeighborhood(String deviceId);

    /**
     * Retrieve 2-hop neighborhood subgraph around a focus device.
     */
    @Query("MATCH (d:NetworkDevice {id: $deviceId}) " +
           "OPTIONAL MATCH (d)-[r:CONNECTED_TO*1..2]-(neighbor:NetworkDevice) " +
           "RETURN d, collect(r), collect(neighbor)")
    List<NetworkDevice> find2HopNeighborhood(String deviceId);
}
