package com.gr2.noc.incident.model;

import com.gr2.noc.hypothesis.model.Hypothesis;
import com.gr2.noc.incident.enums.IncidentStatus;
import com.gr2.noc.incident.enums.Severity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @Column(length = 64)
    private String id; // e.g. "INC-2026-0915"

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.INVESTIGATING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private Severity severity = Severity.CRITICAL;

    private String region;

    @Column(name = "primary_device_id", length = 64)
    private String primaryDeviceId; // Earliest alarmed device, e.g. "SW-HN-02"

    @Column(name = "opened_at", nullable = false)
    private Instant openedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Alarm> alarms = new ArrayList<>();

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Hypothesis> hypotheses = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt;

    public void addAlarm(Alarm alarm) {
        alarms.add(alarm);
        alarm.setIncident(this);
    }

    public void removeAlarm(Alarm alarm) {
        alarms.remove(alarm);
        alarm.setIncident(null);
    }

    public void addHypothesis(Hypothesis hypothesis) {
        hypotheses.add(hypothesis);
        hypothesis.setIncident(this);
    }

    public void removeHypothesis(Hypothesis hypothesis) {
        hypotheses.remove(hypothesis);
        hypothesis.setIncident(null);
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
