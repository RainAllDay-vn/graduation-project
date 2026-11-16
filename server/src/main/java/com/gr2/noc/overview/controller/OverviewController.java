package com.gr2.noc.overview.controller;

import com.gr2.noc.overview.dto.OverviewResponse;
import com.gr2.noc.overview.service.OverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class OverviewController implements OverviewApi {

    private final OverviewService overviewService;

    @Override
    public ResponseEntity<OverviewResponse> getOverview() {
        return ResponseEntity.ok(overviewService.getOverview());
    }
}
