package com.gr2.noc.service.service;

import com.gr2.noc.service.dto.create.CreateNetworkServiceRequest;
import com.gr2.noc.service.dto.get.NetworkServiceDetails;
import com.gr2.noc.service.dto.get.NetworkServiceSummary;
import com.gr2.noc.service.dto.get.ServiceImpactReport;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;

import java.util.List;

/**
 * Service contract for telecom L3 services delivered over the network topology.
 * Manages the service inventory, its dependencies on network devices,
 * and the service-impact report for the Dashboard.
 */
public interface NetworkServiceService {

    /**
     * Retrieve all services, optionally filtered by type, region, status
     * and free-text query on name/description.
     */
    List<NetworkServiceSummary> getServices(ServiceType type, String region, ServiceStatus status, String query);

    /**
     * Retrieve detailed information of a specific service, including
     * its dependent devices.
     */
    NetworkServiceDetails getServiceById(String id);

    /**
     * Create a new service. All dependent device IDs must exist in the topology.
     */
    NetworkServiceDetails createService(CreateNetworkServiceRequest request);

    /**
     * Update lifecycle status of a service (OPERATIONAL, DEGRADED, OUTAGE).
     */
    NetworkServiceDetails updateServiceStatus(String id, ServiceStatus status);

    /**
     * Delete a service by ID.
     */
    void deleteService(String id);

    /**
     * Impact report for a service: counts of dependent devices by status
     * and the list of devices currently affecting the service.
     */
    ServiceImpactReport getServiceImpact(String id);
}
