package com.gr2.noc.hypothesis.controller;

import com.gr2.noc.hypothesis.dto.create.CreateHypothesisRequest;
import com.gr2.noc.hypothesis.dto.get.HypothesisDetails;
import com.gr2.noc.hypothesis.dto.get.HypothesisSummary;
import com.gr2.noc.hypothesis.dto.update.UpdateHypothesisStatusRequest;
import com.gr2.noc.hypothesis.enums.HypothesisStatus;
import com.gr2.noc.hypothesis.service.HypothesisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class HypothesisController implements HypothesisApi {

    private final HypothesisService hypothesisService;

    @Override
    public ResponseEntity<List<HypothesisSummary>> getHypotheses(String incidentId, HypothesisStatus status) {
        return ResponseEntity.ok(hypothesisService.getHypotheses(incidentId, status));
    }

    @Override
    public ResponseEntity<HypothesisDetails> getHypothesisById(String incidentId, Long hypothesisId) {
        return ResponseEntity.ok(hypothesisService.getHypothesisById(incidentId, hypothesisId));
    }

    @Override
    public ResponseEntity<HypothesisDetails> createHypothesis(String incidentId, CreateHypothesisRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hypothesisService.createHypothesis(incidentId, request));
    }

    @Override
    public ResponseEntity<HypothesisDetails> updateHypothesisStatus(
            String incidentId,
            Long hypothesisId,
            UpdateHypothesisStatusRequest request
    ) {
        return ResponseEntity.ok(hypothesisService.updateHypothesisStatus(incidentId, hypothesisId, request));
    }

    @Override
    public ResponseEntity<Void> deleteHypothesis(String incidentId, Long hypothesisId) {
        hypothesisService.deleteHypothesis(incidentId, hypothesisId);
        return ResponseEntity.noContent().build();
    }
}
