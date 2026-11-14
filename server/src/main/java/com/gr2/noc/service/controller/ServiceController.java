package com.gr2.noc.service.controller;

import com.gr2.noc.service.dto.create.CreateNetworkServiceRequest;
import com.gr2.noc.service.dto.get.NetworkServiceDetails;
import com.gr2.noc.service.dto.get.NetworkServiceSummary;
import com.gr2.noc.service.dto.get.ServiceImpactReport;
import com.gr2.noc.service.dto.update.UpdateServiceStatusRequest;
import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.service.service.NetworkServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ServiceController implements ServiceApi {

    private final NetworkServiceService networkServiceService;

    @Override
    public ResponseEntity<List<NetworkServiceSummary>> getServices(
            ServiceType type, String region, ServiceStatus status, String q
    ) {
        return ResponseEntity.ok(networkServiceService.getServices(type, region, status, q));
    }

    @Override
    public ResponseEntity<NetworkServiceDetails> getServiceById(String id) {
        return ResponseEntity.ok(networkServiceService.getServiceById(id));
    }

    @Override
    public ResponseEntity<ServiceImpactReport> getServiceImpact(String id) {
        return ResponseEntity.ok(networkServiceService.getServiceImpact(id));
    }

    @Override
    public ResponseEntity<NetworkServiceDetails> createService(CreateNetworkServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(networkServiceService.createService(request));
    }

    @Override
    public ResponseEntity<NetworkServiceDetails> updateServiceStatus(String id, UpdateServiceStatusRequest request) {
        return ResponseEntity.ok(networkServiceService.updateServiceStatus(id, request.status()));
    }

    @Override
    public ResponseEntity<Void> deleteService(String id) {
        networkServiceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
