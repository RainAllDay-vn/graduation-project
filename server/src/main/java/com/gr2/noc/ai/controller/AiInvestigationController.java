package com.gr2.noc.ai.controller;

import com.gr2.noc.ai.dto.InvestigationResult;
import com.gr2.noc.ai.service.InvestigationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AiInvestigationController implements AiInvestigationApi {

    private final InvestigationService investigationService;

    @Override
    public ResponseEntity<InvestigationResult> triggerInvestigation(String incidentId) {
        return ResponseEntity.ok(investigationService.runInvestigation(incidentId));
    }

    @Override
    public ResponseEntity<InvestigationResult> getLatestInvestigation(String incidentId) {
        return ResponseEntity.ok(investigationService.getLatestInvestigation(incidentId));
    }
}
