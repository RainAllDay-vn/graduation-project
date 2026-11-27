package com.gr2.noc.service.repository;

import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.service.model.NetworkService;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NetworkServiceRepository extends Neo4jRepository<NetworkService, String> {

    List<NetworkService> findByType(ServiceType type);

    List<NetworkService> findByRegion(String region);

    List<NetworkService> findByStatus(ServiceStatus status);

    /**
     * Retrieve all services along with their dependent devices and device links.
     */
    @Query("MATCH (s:NetworkService) " +
           "OPTIONAL MATCH (s)-[dep:DEPENDS_ON]->(d:NetworkDevice) " +
           "OPTIONAL MATCH (d)-[r:CONNECTED_TO]->(t:NetworkDevice) " +
           "RETURN s, collect(dep), collect(d), collect(r), collect(t)")
    List<NetworkService> findAllWithDevices();

    /**
     * Retrieve a specific service along with its dependent devices and device links.
     */
    @Query("MATCH (s:NetworkService {id: $serviceId}) " +
           "OPTIONAL MATCH (s)-[dep:DEPENDS_ON]->(d:NetworkDevice) " +
           "OPTIONAL MATCH (d)-[r:CONNECTED_TO]->(t:NetworkDevice) " +
           "RETURN s, collect(dep), collect(d), collect(r), collect(t)")
    Optional<NetworkService> findByIdWithDevices(String serviceId);
}
