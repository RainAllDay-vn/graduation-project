package com.gr2.noc.source.service;

import com.gr2.noc.source.dto.create.CreateExternalSourceRequest;
import com.gr2.noc.source.dto.get.ExternalSourceDetails;
import com.gr2.noc.source.dto.get.ExternalSourceSummary;
import com.gr2.noc.source.dto.get.FieldMappingDto;
import com.gr2.noc.source.dto.update.UpdateExternalSourceRequest;
import com.gr2.noc.source.enums.SourceAuthType;
import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.model.ExternalSource;
import com.gr2.noc.source.repository.ExternalSourceRepository;
import com.gr2.noc.source.repository.SourceSyncRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SourceServiceImpl implements SourceService {

    private final ExternalSourceRepository sourceRepository;
    private final SourceSyncRecordRepository syncRecordRepository;

    @Override
    public List<ExternalSourceSummary> getSources(SourceType type, SourceStatus status, String q) {
        return sourceRepository.findAllByOrderByCreatedAtAsc().stream()
                .filter(source -> type == null || source.getType() == type)
                .filter(source -> status == null || source.getStatus() == status)
                .filter(source -> matchesQuery(source, q))
                .map(ExternalSourceSummary::from)
                .toList();
    }

    @Override
    public ExternalSourceDetails getSourceById(String id) {
        return ExternalSourceDetails.from(findEntity(id));
    }

    @Override
    public ExternalSourceDetails createSource(CreateExternalSourceRequest request) {
        String name = request.name() != null ? request.name().trim() : null;
        if (name != null && sourceRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Data source already exists with name: " + name);
        }
        validateTypeConfig(request.type(), request.endpointUrl(), request.pollIntervalSeconds(),
                request.brokerAddress(), request.topic());

        ExternalSource source = ExternalSource.builder()
                .id(generateSourceId())
                .name(name)
                .type(request.type())
                .endpointUrl(request.endpointUrl())
                .pollIntervalSeconds(request.pollIntervalSeconds())
                .brokerAddress(request.brokerAddress())
                .topic(request.topic())
                .consumerGroup(request.consumerGroup())
                .authType(request.authType() != null ? request.authType() : SourceAuthType.NONE)
                .authToken(request.authToken())
                .build();
        if (source == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create data source");
        }
        return ExternalSourceDetails.from(sourceRepository.save(source));
    }

    @Override
    @Transactional
    public ExternalSourceDetails updateSource(String id, UpdateExternalSourceRequest request) {
        ExternalSource source = findEntity(id);
        if (source == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Data source not found with ID: " + id);
        }

        if (request.endpointUrl() != null) {
            source.setEndpointUrl(request.endpointUrl());
        }
        if (request.pollIntervalSeconds() != null) {
            source.setPollIntervalSeconds(request.pollIntervalSeconds());
        }
        if (request.brokerAddress() != null) {
            source.setBrokerAddress(request.brokerAddress());
        }
        if (request.topic() != null) {
            source.setTopic(request.topic());
        }
        if (request.consumerGroup() != null) {
            source.setConsumerGroup(request.consumerGroup());
        }
        if (request.authType() != null) {
            source.setAuthType(request.authType());
        }
        if (request.authToken() != null) {
            source.setAuthToken(request.authToken().isBlank() ? null : request.authToken());
        }
        if (request.fieldMappings() != null) {
            source.getFieldMappings().clear();
            request.fieldMappings().stream()
                    .filter(Objects::nonNull)
                    .map(FieldMappingDto::toEntity)
                    .forEach(source.getFieldMappings()::add);
        }

        validateTypeConfig(source.getType(), source.getEndpointUrl(), source.getPollIntervalSeconds(),
                source.getBrokerAddress(), source.getTopic());
        return ExternalSourceDetails.from(sourceRepository.save(source));
    }

    @Override
    @Transactional
    public void deleteSource(String id) {
        ExternalSource source = findEntity(id);
        if (source == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Data source not found with ID: " + id);
        }
        syncRecordRepository.deleteBySourceId(source.getId());
        sourceRepository.delete(source);
    }

    private ExternalSource findEntity(String id) {
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source id is required");
        }
        return sourceRepository.findById(id).orElse(null);
    }

    private boolean matchesQuery(ExternalSource source, String q) {
        if (q == null || q.isBlank()) {
            return true;
        }
        String query = q.toLowerCase();
        String name = source.getName() != null ? source.getName().toLowerCase() : "";
        String topic = source.getTopic() != null ? source.getTopic().toLowerCase() : "";
        return name.contains(query)
                || source.getId().toLowerCase().contains(query)
                || topic.contains(query);
    }

    private void validateTypeConfig(SourceType type, String endpointUrl, Integer pollIntervalSeconds,
                                    String brokerAddress, String topic) {
        if (type == SourceType.REST) {
            if (endpointUrl == null || endpointUrl.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Endpoint URL is required for REST sources");
            }
            if (!endpointUrl.startsWith("http://") && !endpointUrl.startsWith("https://")) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Endpoint URL must start with http:// or https://");
            }
            if (pollIntervalSeconds != null && pollIntervalSeconds <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Poll interval must be greater than 0 seconds");
            }
        } else if (type == SourceType.MQ) {
            if (brokerAddress == null || brokerAddress.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Broker address is required for message queue sources");
            }
            if (topic == null || topic.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Topic is required for message queue sources");
            }
        }
    }

    private String generateSourceId() {
        String candidate;
        do {
            candidate = "DS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (sourceRepository.existsById(candidate));
        return candidate;
    }
}
