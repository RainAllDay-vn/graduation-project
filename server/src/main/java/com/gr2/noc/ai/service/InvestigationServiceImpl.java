package com.gr2.noc.ai.service;

import com.gr2.noc.ai.dto.InvestigationResult;
import com.gr2.noc.ai.workflow.IncidentInvestigationWorkflow;
import com.gr2.noc.hypothesis.dto.get.HypothesisDetails;
import com.gr2.noc.hypothesis.model.Hypothesis;
import com.gr2.noc.hypothesis.repository.HypothesisRepository;
import com.gr2.noc.incident.dto.get.IncidentDetails;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InvestigationServiceImpl implements InvestigationService {

    private final IncidentInvestigationWorkflow workflow;
    private final IncidentService incidentService;
    private final HypothesisRepository hypothesisRepository;

    @Override
    public InvestigationResult runInvestigation(String incidentId) {
        IncidentDetails incident = incidentService.getIncidentById(incidentId);
        if (incident.status() == IncidentStatus.RESOLVED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Incident already resolved, nothing to investigate: " + incidentId
            );
        }
        return workflow.execute(incidentId);
    }

    @Override
    public InvestigationResult getLatestInvestigation(String incidentId) {
        incidentService.getIncidentById(incidentId);
        List<Hypothesis> hypotheses = hypothesisRepository.findByIncidentIdOrderByRankAsc(incidentId);
        List<HypothesisDetails> details = hypotheses.stream()
                .map(HypothesisDetails::from)
                .toList();
        return InvestigationResult.builder()
                .incidentId(incidentId)
                .hypotheses(details)
                .consultedRunbooks(List.of())
                .duration(null)
                .engineType(null)
                .build();
    }
}
