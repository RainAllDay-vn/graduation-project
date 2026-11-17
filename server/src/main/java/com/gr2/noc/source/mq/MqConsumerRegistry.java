package com.gr2.noc.source.mq;

import com.gr2.noc.source.enums.SourceStatus;
import com.gr2.noc.source.enums.SourceType;
import com.gr2.noc.source.enums.SyncStatus;
import com.gr2.noc.source.model.ExternalSource;
import com.gr2.noc.source.repository.ExternalSourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class MqConsumerRegistry {

    static final String EXCHANGE_NAME = "noc.sources";
    private static final String QUEUE_PREFIX = "noc.source.";

    private final ExternalSourceRepository sourceRepository;
    private final MqMessageHandler messageHandler;
    private final ConnectionFactory connectionFactory;
    private final AmqpAdmin amqpAdmin;

    @Value("${spring.rabbitmq.listener.simple.auto-startup:true}")
    private boolean listenerEnabled;

    private final Map<String, RunningContainer> containers = new HashMap<>();

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        refresh();
    }

    @Scheduled(fixedDelay = 30_000)
    public void scheduledRefresh() {
        refresh();
    }

    public synchronized void refresh() {
        if (!listenerEnabled) {
            return;
        }
        Map<String, String> desired = new HashMap<>();
        for (ExternalSource source : sourceRepository.findAllByOrderByCreatedAtAsc()) {
            if (source.getType() == SourceType.MQ && source.getStatus() != SourceStatus.ERROR) {
                String topic = source.getTopic() != null && !source.getTopic().isBlank()
                        ? source.getTopic().trim()
                        : "#";
                desired.put(source.getId(), topic);
            }
        }
        containers.entrySet().removeIf(entry -> {
            String topic = desired.get(entry.getKey());
            if (topic == null || !topic.equals(entry.getValue().topic)) {
                stopContainer(entry.getKey(), entry.getValue());
                return true;
            }
            return false;
        });
        for (Map.Entry<String, String> entry : desired.entrySet()) {
            if (!containers.containsKey(entry.getKey())) {
                startContainer(entry.getKey(), entry.getValue());
            }
        }
    }

    private void startContainer(String sourceId, String topic) {
        try {
            TopicExchange exchange = new TopicExchange(EXCHANGE_NAME, true, false);
            amqpAdmin.declareExchange(exchange);
            String queueName = amqpAdmin.declareQueue(new Queue(QUEUE_PREFIX + sourceId, true));
            Binding binding = BindingBuilder.bind(new Queue(queueName)).to(exchange).with(topic);
            amqpAdmin.declareBinding(binding);

            SimpleMessageListenerContainer container = new SimpleMessageListenerContainer(connectionFactory);
            container.setQueueNames(queueName);
            container.setMessageListener(message -> onMessage(sourceId, message));
            container.setDefaultRequeueRejected(false);
            container.setMissingQueuesFatal(false);
            container.start();
            containers.put(sourceId, new RunningContainer(container, topic));
            log.info("MQ consumer started for source {} on topic {}", sourceId, topic);
        } catch (Exception e) {
            log.warn("Could not start MQ consumer for source {}: {}", sourceId, e.getMessage());
        }
    }

    private void stopContainer(String sourceId, RunningContainer running) {
        try {
            running.container().stop();
            amqpAdmin.deleteQueue(QUEUE_PREFIX + sourceId);
            log.info("MQ consumer stopped for source {}", sourceId);
        } catch (Exception e) {
            log.warn("Could not stop MQ consumer for source {}: {}", sourceId, e.getMessage());
        }
    }

    private void onMessage(String sourceId, Message message) {
        String raw = new String(message.getBody(), StandardCharsets.UTF_8);
        MqIngestResult result = messageHandler.handle(raw);
        recordOutcome(sourceId, result);
    }

    private void recordOutcome(String sourceId, MqIngestResult result) {
        try {
            sourceRepository.findById(sourceId).ifPresent(source -> {
                source.setLastSyncAt(Instant.now());
                if (result.success()) {
                    source.setLastSyncStatus(SyncStatus.SUCCESS);
                    source.setLastSyncMessage(null);
                    source.setStatus(SourceStatus.ACTIVE);
                    source.setRetryAttempts(0);
                } else {
                    source.setLastSyncStatus(SyncStatus.FAILED);
                    source.setLastSyncMessage(result.message());
                }
                sourceRepository.save(source);
            });
        } catch (Exception e) {
            log.warn("Could not update source status after MQ message: {}", e.getMessage());
        }
        if (!result.success()) {
            log.warn("MQ message rejected for source {}: {}", sourceId, result.message());
        }
    }

    private record RunningContainer(SimpleMessageListenerContainer container, String topic) {
    }
}
