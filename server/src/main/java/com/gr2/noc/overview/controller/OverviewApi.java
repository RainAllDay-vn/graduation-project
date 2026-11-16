package com.gr2.noc.overview.controller;

import com.gr2.noc.overview.dto.OverviewResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * REST API contract for the aggregated Tổng quan (Overview) page payload:
 * the four health metric cards (active nodes, open alarms, in-progress
 * incidents, disconnected ports) and the recently resolved incidents.
 */
@RequestMapping("/api/overview")
public interface OverviewApi {

    /**
     * Assemble the current network health metrics, the top open incident and
     * the most recently resolved incidents in a single response.
     */
    @GetMapping
    ResponseEntity<OverviewResponse> getOverview();
}
