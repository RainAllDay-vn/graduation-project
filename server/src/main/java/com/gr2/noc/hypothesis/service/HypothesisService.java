package com.gr2.noc.hypothesis.service;

import com.gr2.noc.hypothesis.dto.create.CreateHypothesisRequest;
import com.gr2.noc.hypothesis.dto.get.HypothesisDetails;
import com.gr2.noc.hypothesis.dto.get.HypothesisSummary;
import com.gr2.noc.hypothesis.dto.update.UpdateHypothesisStatusRequest;
import com.gr2.noc.hypothesis.enums.HypothesisStatus;

import java.util.List;

public interface HypothesisService {

    List<HypothesisSummary> getHypotheses(String incidentId, HypothesisStatus status);

    HypothesisDetails getHypothesisById(String incidentId, Long hypothesisId);

    HypothesisDetails createHypothesis(String incidentId, CreateHypothesisRequest request);

    HypothesisDetails updateHypothesisStatus(String incidentId, Long hypothesisId, UpdateHypothesisStatusRequest request);

    void deleteHypothesis(String incidentId, Long hypothesisId);
}
