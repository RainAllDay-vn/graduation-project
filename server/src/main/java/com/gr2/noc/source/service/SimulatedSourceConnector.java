package com.gr2.noc.source.service;

import com.gr2.noc.source.dto.get.TestConnectionResult;
import com.gr2.noc.source.enums.SourceAuthType;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.model.ExternalSource;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.sources.sync.simulated", havingValue = "true", matchIfMissing = true)
public class SimulatedSourceConnector implements SourceConnector {

    @Override
    public TestConnectionResult testConnection(ExternalSource source) {
        String failure = missingTokenMessage(source);
        if (failure != null) {
            return TestConnectionResult.builder().success(false).message(failure).build();
        }
        long latencyMs = 60 + Math.floorMod(source.getId().hashCode(), 140);
        String message = source.getType() == SourceType.MQ
                ? "Kết nối broker thành công (mô phỏng)"
                : "Kết nối REST thành công (mô phỏng)";
        return TestConnectionResult.builder().success(true).message(message).latencyMs(latencyMs).build();
    }

    @Override
    public SyncFetchResult fetch(ExternalSource source) {
        String failure = missingTokenMessage(source);
        if (failure != null) {
            return SyncFetchResult.failed(failure);
        }
        int seed = Math.abs(source.getId().hashCode());
        long records = 12000 + Math.floorMod(seed, 800);
        return SyncFetchResult.success(records, 0);
    }

    private String missingTokenMessage(ExternalSource source) {
        if (source.getAuthType() != null
                && source.getAuthType() != SourceAuthType.NONE
                && (source.getAuthToken() == null || source.getAuthToken().isBlank())) {
            return "Token xác thực chưa được cấu hình hoặc đã hết hạn";
        }
        return null;
    }
}
