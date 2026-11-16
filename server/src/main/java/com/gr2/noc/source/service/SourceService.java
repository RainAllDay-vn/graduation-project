package com.gr2.noc.source.service;

import com.gr2.noc.source.dto.create.CreateExternalSourceRequest;
import com.gr2.noc.source.dto.get.ExternalSourceDetails;
import com.gr2.noc.source.dto.get.ExternalSourceSummary;
import com.gr2.noc.source.dto.update.UpdateExternalSourceRequest;
import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;

import java.util.List;

public interface SourceService {

    List<ExternalSourceSummary> getSources(SourceType type, SourceStatus status, String q);

    ExternalSourceDetails getSourceById(String id);

    ExternalSourceDetails createSource(CreateExternalSourceRequest request);

    ExternalSourceDetails updateSource(String id, UpdateExternalSourceRequest request);

    void deleteSource(String id);
}
