package com.gr2.noc.source.mq;

import org.awaitility.Awaitility;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.model.ExternalSource;
import com.gr2.noc.source.repository.ExternalSourceRepository;
import com.gr2.noc.telemetry.model.TelemetryTimeseriesPoint;
import com.gr2.noc.telemetry.repository.TelemetryTimeseriesRepository;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Testcontainers
@SpringBootTest
@TestPropertySource(properties = "spring.rabbitmq.listener.simple.auto-startup=true")
class MqConsumerRegistryIntegrationTest {

    private static final String TOPIC_PREFIX = "noc.telemetry.mqit";

    @Container
    static RabbitMQContainer rabbit = new RabbitMQContainer(DockerImageName.parse("rabbitmq:3-alpine"));

    @DynamicPropertySource
    static void rabbitProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.rabbitmq.host", rabbit::getHost);
        registry.add("spring.rabbitmq.port", () -> rabbit.getAmqpPort());
        registry.add("spring.rabbitmq.username", () -> "guest");
        registry.add("spring.rabbitmq.password", () -> "guest");
    }

    @Autowired
    private MqConsumerRegistry registry;

    @Autowired
    private ExternalSourceRepository sourceRepository;

    @Autowired
    private TelemetryTimeseriesRepository timeseriesRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Test
    void shouldConsumeTelemetryPointsFromRealBroker() {
        String suffix = Long.toString(System.nanoTime());
        String topic = TOPIC_PREFIX + "." + suffix;
        String deviceId = "DEV-MQIT-" + suffix;
        String metric = "CPU_" + suffix;
        String sourceId = "DS-MQIT-" + suffix;
        sourceRepository.save(ExternalSource.builder()
                .id(sourceId)
                .name("MQ integration test " + sourceId)
                .type(SourceType.MQ)
                .brokerAddress(rabbit.getHost() + ":" + rabbit.getAmqpPort())
                .topic(topic)
                .build());
        registry.refresh();

        rabbitTemplate.convertAndSend(MqConsumerRegistry.EXCHANGE_NAME, topic, """
                {
                  "type": "telemetry.points",
                  "payload": {
                    "deviceId": "%s",
                    "metricName": "%s",
                    "unit": "%%",
                    "points": [
                      {"timestamp": "2026-11-17T10:00:00Z", "value": 40.0},
                      {"timestamp": "2026-11-17T10:01:00Z", "value": 55.5}
                    ]
                  }
                }
                """.formatted(deviceId, metric));

        List<TelemetryTimeseriesPoint> points = Awaitility.await()
                .atMost(Duration.ofSeconds(15))
                .until(() -> timeseriesRepository
                        .findByDeviceIdAndMetricNameAndTimestampBetweenOrderByTimestampAsc(
                                deviceId, metric, Instant.parse("2026-11-16T00:00:00Z"), Instant.parse("2026-11-18T00:00:00Z")),
                        stored -> stored.size() >= 2);
        assertEquals(40.0, points.get(0).getValue());
        assertEquals(55.5, points.get(1).getValue());

        ExternalSource source = sourceRepository.findById(sourceId).orElseThrow();
        assertEquals(SyncStatus.SUCCESS, source.getLastSyncStatus());
        assertEquals(SourceStatus.ACTIVE, source.getStatus());
    }

    @Test
    void shouldMarkSourceFailedOnPoisonMessage() {
        String suffix = Long.toString(System.nanoTime());
        String topic = TOPIC_PREFIX + "." + suffix;
        String sourceId = "DS-MQIT-" + suffix;
        sourceRepository.save(ExternalSource.builder()
                .id(sourceId)
                .name("MQ poison test " + sourceId)
                .type(SourceType.MQ)
                .brokerAddress(rabbit.getHost() + ":" + rabbit.getAmqpPort())
                .topic(topic)
                .build());
        registry.refresh();

        rabbitTemplate.convertAndSend(MqConsumerRegistry.EXCHANGE_NAME, topic, "{not json");

        ExternalSource source = Awaitility.await()
                .atMost(Duration.ofSeconds(15))
                .until(() -> sourceRepository.findById(sourceId).orElse(null),
                        updated -> updated != null && updated.getLastSyncStatus() == SyncStatus.FAILED);
        assertNotNull(source.getLastSyncMessage());
        assertTrue(source.getLastSyncMessage().contains("Lỗi xử lý thông điệp"));
        assertEquals(SourceStatus.PENDING_FIRST_SYNC, source.getStatus());
    }
}
