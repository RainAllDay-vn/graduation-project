package com.gr2.noc.service.controller;

import com.gr2.noc.service.dto.create.CreateNetworkServiceRequest;
import com.gr2.noc.service.dto.get.NetworkServiceDetails;
import com.gr2.noc.service.dto.get.NetworkServiceSummary;
import com.gr2.noc.service.dto.get.ServiceImpactReport;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.service.dto.update.UpdateServiceStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API Contract for telecom L3 service inventory management.
 * Backs the Tra cứu page's Services tab and the Dashboard's service-impact view.
 */
@RequestMapping("/api/services")
public interface ServiceApi {

    /**
     * Retrieve all services, optionally filtered by type, region, status
     * and free-text query on name/description/ID.
     */
    @GetMapping
    ResponseEntity<List<NetworkServiceSummary>> getServices(
            @RequestParam(required = false) ServiceType type,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) ServiceStatus status,
            @RequestParam(required = false) String q
    );

    /**
     * Retrieve detailed information of a specific service, including
     * its dependent devices.
     */
    @GetMapping("/{id}")
    ResponseEntity<NetworkServiceDetails> getServiceById(@PathVariable String id);

    /**
     * Impact report of a service: dependent device health counts and
     * the devices currently affecting the service.
     */
    @GetMapping("/{id}/impact")
    ResponseEntity<ServiceImpactReport> getServiceImpact(@PathVariable String id);

    /**
     * Create a new service. All dependent device IDs must exist in the topology.
     */
    @PostMapping
    ResponseEntity<NetworkServiceDetails> createService(@Valid @RequestBody CreateNetworkServiceRequest request);

    /**
     * Update lifecycle status of a service (OPERATIONAL, DEGRADED, OUTAGE).
     */
    @PatchMapping("/{id}/status")
    ResponseEntity<NetworkServiceDetails> updateServiceStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateServiceStatusRequest request
    );

    /**
     * Delete a service by ID.
     */
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteService(@PathVariable String id);
}
