package com.gr2.noc.source.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gr2.noc.source.dto.get.TestConnectionResult;
import com.gr2.noc.source.enums.SourceAuthType;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.ingest.IngestResult;
import com.gr2.noc.source.ingest.SourceIngestionService;
import com.gr2.noc.source.model.ExternalSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
@ConditionalOnProperty(name = "app.sources.sync.simulated", havingValue = "false")
@Slf4j
public class RestSourceConnector implements SourceConnector {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final SourceIngestionService ingestionService;
    private final int connectTimeoutSeconds;

    public RestSourceConnector(
            @Value("${app.sources.connect-timeout-seconds:5}") int connectTimeoutSeconds,
            ObjectMapper objectMapper,
            SourceIngestionService ingestionService
    ) {
        this.connectTimeoutSeconds = connectTimeoutSeconds;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(connectTimeoutSeconds))
                .build();
        this.objectMapper = objectMapper;
        this.ingestionService = ingestionService;
    }

    @Override
    public TestConnectionResult testConnection(ExternalSource source) {
        if (source.getType() == SourceType.MQ) {
            return testBrokerSocket(source);
        }
        long startedAt = System.currentTimeMillis();
        try {
            HttpResponse<String> response = sendGet(source, null);
            long latencyMs = System.currentTimeMillis() - startedAt;
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return TestConnectionResult.builder()
                        .success(false)
                        .message("Nguồn trả về mã HTTP " + response.statusCode())
                        .latencyMs(latencyMs)
                        .build();
            }
            return TestConnectionResult.builder()
                    .success(true)
                    .message("Kết nối REST thành công")
                    .latencyMs(latencyMs)
                    .build();
        } catch (IllegalArgumentException e) {
            return TestConnectionResult.builder().success(false).message("Địa chỉ REST không hợp lệ").build();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return TestConnectionResult.builder().success(false).message("Kết nối bị gián đoạn").build();
        } catch (Exception e) {
            return TestConnectionResult.builder()
                    .success(false)
                    .message("Không kết nối được tới nguồn: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public SyncFetchResult fetch(ExternalSource source, Instant since) {
        if (source.getType() == SourceType.MQ) {
            return SyncFetchResult.failed("Nguồn message queue nhận sự kiện liên tục, không hỗ trợ kéo dữ liệu");
        }
        try {
            HttpResponse<String> response = sendGet(source, since);
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return SyncFetchResult.failed("Nguồn trả về mã HTTP " + response.statusCode());
            }
            return ingestResponse(response.body());
        } catch (IllegalArgumentException e) {
            return SyncFetchResult.failed("Địa chỉ REST không hợp lệ");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return SyncFetchResult.failed("Đồng bộ bị gián đoạn");
        } catch (Exception e) {
            return SyncFetchResult.failed("Không đồng bộ được từ nguồn: " + e.getMessage());
        }
    }

    private SyncFetchResult ingestResponse(String body) {
        if (body == null || body.isBlank()) {
            return SyncFetchResult.success(0, 0);
        }
        JsonNode root;
        try {
            root = objectMapper.readTree(body);
        } catch (Exception e) {
            return SyncFetchResult.failed("Phản hồi của nguồn không phải JSON hợp lệ");
        }

        List<JsonNode> messages = new ArrayList<>();
        if (root.isArray()) {
            root.forEach(messages::add);
        } else {
            messages.add(root);
        }

        long ingested = 0;
        int skipped = 0;
        int failedMessages = 0;
        String firstError = null;
        for (IngestResult result : ingestionService.ingestBatch(messages)) {
            if (result.success()) {
                ingested += result.recordsIngested();
                skipped += result.recordsFailed();
            } else {
                failedMessages++;
                if (firstError == null) {
                    firstError = result.message();
                }
            }
        }
        if (failedMessages > 0) {
            return SyncFetchResult.failed(
                    failedMessages + "/" + messages.size() + " thông điệp xử lý thất bại: " + firstError);
        }
        return SyncFetchResult.success(ingested, skipped);
    }

    private URI buildUri(ExternalSource source, Instant since) {
        String url = source.getEndpointUrl();
        if (since != null) {
            String separator = url.contains("?") ? "&" : "?";
            url = url + separator + "since=" + URLEncoder.encode(since.toString(), StandardCharsets.UTF_8);
        }
        return URI.create(url);
    }

    private HttpResponse<String> sendGet(ExternalSource source, Instant since) throws Exception {
        URI uri = buildUri(source, since);
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri)
                .timeout(Duration.ofSeconds(connectTimeoutSeconds))
                .GET();
        if ("http".equalsIgnoreCase(uri.getScheme())) {
            // Avoid h2c upgrade headers on plaintext HTTP/1.1 servers (e.g. Uvicorn mock-source)
            builder.version(HttpClient.Version.HTTP_1_1);
        }
        if (source.getAuthType() == SourceAuthType.BEARER_TOKEN && source.getAuthToken() != null) {
            builder.header("Authorization", "Bearer " + source.getAuthToken());
        } else if (source.getAuthType() == SourceAuthType.API_KEY && source.getAuthToken() != null) {
            builder.header("X-API-Key", source.getAuthToken());
        }
        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private TestConnectionResult testBrokerSocket(ExternalSource source) {
        String address = source.getBrokerAddress() != null ? source.getBrokerAddress() : "";
        int colon = address.lastIndexOf(':');
        if (colon <= 0 || colon == address.length() - 1) {
            return TestConnectionResult.builder().success(false).message("Địa chỉ broker không hợp lệ").build();
        }
        String host = address.substring(0, colon);
        try {
            int port = Integer.parseInt(address.substring(colon + 1));
            long startedAt = System.currentTimeMillis();
            try (Socket socket = new Socket()) {
                socket.connect(new InetSocketAddress(host, port), connectTimeoutSeconds * 1000);
            }
            long latencyMs = System.currentTimeMillis() - startedAt;
            return TestConnectionResult.builder()
                    .success(true)
                    .message("Kết nối broker thành công")
                    .latencyMs(latencyMs)
                    .build();
        } catch (NumberFormatException e) {
            return TestConnectionResult.builder().success(false).message("Cổng broker không hợp lệ").build();
        } catch (Exception e) {
            return TestConnectionResult.builder()
                    .success(false)
                    .message("Không kết nối được broker: " + e.getMessage())
                    .build();
        }
    }
}
