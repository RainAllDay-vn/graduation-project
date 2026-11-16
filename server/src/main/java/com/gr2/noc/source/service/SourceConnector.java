package com.gr2.noc.source.service;

import com.gr2.noc.source.dto.get.TestConnectionResult;
import com.gr2.noc.source.model.ExternalSource;

public interface SourceConnector {

    TestConnectionResult testConnection(ExternalSource source);

    SyncFetchResult fetch(ExternalSource source);
}
