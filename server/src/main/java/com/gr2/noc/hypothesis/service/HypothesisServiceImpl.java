package com.gr2.noc.hypothesis.service;

import com.gr2.noc.hypothesis.dto.create.CreateHypothesisRequest;
import com.gr2.noc.hypothesis.dto.get.HypothesisDetails;
import com.gr2.noc.hypothesis.dto.get.HypothesisSummary;
import com.gr2.noc.hypothesis.dto.update.UpdateHypothesisStatusRequest;
import com.gr2.noc.hypothesis.enums.HypothesisStatus;
import com.gr2.noc.hypothesis.model.Hypothesis;
import com.gr2.noc.hypothesis.repository.HypothesisRepository;
import com.gr2.noc.incident.model.Incident;
import com.gr2.noc.incident.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HypothesisServiceImpl implements HypothesisService {

    private final HypothesisRepository hypothesisRepository;
    private final IncidentRepository incidentRepository;

    @Override
    public List<HypothesisSummary> getHypotheses(String incidentId, HypothesisStatus status) {
        ensureIncidentExists(incidentId);

        List<Hypothesis> hypotheses;
        if (status != null) {
            hypotheses = hypothesisRepository.findByIncidentIdAndStatusOrderByRankAsc(incidentId, status);
        } else {
            hypotheses = hypothesisRepository.findByIncidentIdOrderByRankAsc(incidentId);
        }

        return hypotheses.stream()
                .map(HypothesisSummary::from)
                .toList();
    }

    @Override
    public HypothesisDetails getHypothesisById(String incidentId, Long hypothesisId) {
        ensureIncidentExists(incidentId);

        return hypothesisRepository.findByIdAndIncidentId(hypothesisId, incidentId)
                .map(HypothesisDetails::from)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Hypothesis " + hypothesisId + " not found under incident " + incidentId
                ));
    }

    @Override
    @Transactional
    public HypothesisDetails createHypothesis(String incidentId, CreateHypothesisRequest request) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Incident not found with ID: " + incidentId
                ));

        Hypothesis hypothesis = Hypothesis.builder()
                .incident(incident)
                .rank(request.rank())
                .matchScore(request.matchScore())
                .title(request.title())
                .shortTitle(request.shortTitle())
                .targetType(request.targetType())
                .targetId(request.targetId())
                .sourceNode(request.sourceNode())
                .targetNode(request.targetNode())
                .sourcePort(request.sourcePort())
                .targetPort(request.targetPort())
                .confidenceRationale(request.confidenceRationale())
                .status(HypothesisStatus.UNDER_CONSIDERATION)
                .cliCommand(request.cliCommand())
                .verificationCmd(request.verificationCmd())
                .evidence(request.evidence() != null ? new ArrayList<>(request.evidence()) : new ArrayList<>())
                .contradictingEvidence(request.contradictingEvidence() != null ? new ArrayList<>(request.contradictingEvidence()) : new ArrayList<>())
                .createdAt(Instant.now())
                .build();

        Hypothesis saved = hypothesisRepository.save(hypothesis);
        return HypothesisDetails.from(saved);
    }

    @Override
    @Transactional
    public HypothesisDetails updateHypothesisStatus(String incidentId, Long hypothesisId, UpdateHypothesisStatusRequest request) {
        ensureIncidentExists(incidentId);

        Hypothesis hypothesis = hypothesisRepository.findByIdAndIncidentId(hypothesisId, incidentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Hypothesis " + hypothesisId + " not found under incident " + incidentId
                ));

        if (request.status() == HypothesisStatus.REJECTED) {
            if (request.reason() == null || request.reason().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Rejection reason is required when rejecting a hypothesis"
                );
            }
            hypothesis.setStatus(HypothesisStatus.REJECTED);
            hypothesis.setRejectionReason(request.reason().trim());
        } else if (request.status() == HypothesisStatus.CONFIRMED) {
            hypothesis.setStatus(HypothesisStatus.CONFIRMED);
            hypothesis.setRejectionReason(null);
        } else if (request.status() == HypothesisStatus.UNDER_CONSIDERATION) {
            hypothesis.setStatus(HypothesisStatus.UNDER_CONSIDERATION);
            hypothesis.setRejectionReason(null);
        }

        Hypothesis updated = hypothesisRepository.save(hypothesis);
        return HypothesisDetails.from(updated);
    }

    @Override
    @Transactional
    public void deleteHypothesis(String incidentId, Long hypothesisId) {
        ensureIncidentExists(incidentId);

        Hypothesis hypothesis = hypothesisRepository.findByIdAndIncidentId(hypothesisId, incidentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Hypothesis " + hypothesisId + " not found under incident " + incidentId
                ));

        hypothesisRepository.delete(hypothesis);
    }

    private void ensureIncidentExists(String incidentId) {
        if (!incidentRepository.existsById(incidentId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Incident not found with ID: " + incidentId
            );
        }
    }
}
