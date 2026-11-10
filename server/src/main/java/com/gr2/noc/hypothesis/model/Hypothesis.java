package com.gr2.noc.hypothesis.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gr2.noc.hypothesis.enums.HypothesisStatus;
import com.gr2.noc.incident.model.Incident;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hypotheses", indexes = {
    @Index(name = "idx_hypo_incident_rank", columnList = "incident_id, rank_order")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hypothesis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    @JsonIgnore
    private Incident incident;

    @Column(name = "rank_order", nullable = false)
    private Integer rank; // 1, 2, 3

    @Column(name = "match_score", nullable = false)
    private Integer matchScore; // e.g. 88 (hiển thị màu hổ phách "khớp 88%" ở mục 4.3)

    @Column(nullable = false)
    private String title; // e.g. "Suy hao tín hiệu cáp quang CORE-02 ↔ AGG-02"

    @Column(name = "short_title")
    private String shortTitle;

    @Column(name = "target_type", length = 32)
    private String targetType; // "EDGE" hoặc "NODE"

    @Column(name = "target_id", length = 64)
    private String targetId; // ID liên kết hoặc node cần beacon (e.g. "CORE-02 ↔ AGG-02")

    @Column(name = "source_node", length = 64)
    private String sourceNode;

    @Column(name = "target_node", length = 64)
    private String targetNode;

    @Column(name = "source_port", length = 64)
    private String sourcePort;

    @Column(name = "target_port", length = 64)
    private String targetPort;

    @Column(name = "confidence_rationale", columnDefinition = "TEXT")
    private String confidenceRationale; // Cơ sở xếp hạng

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private HypothesisStatus status = HypothesisStatus.UNDER_CONSIDERATION;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason; // Lý do kỹ sư bác bỏ (nhập tại mục 5.6)

    @Column(name = "cli_command")
    private String cliCommand; // Câu lệnh Quick CLI kiểm tra nhanh

    @Column(name = "verification_cmd")
    private String verificationCmd;

    @ElementCollection
    @CollectionTable(name = "hypothesis_evidence", joinColumns = @JoinColumn(name = "hypothesis_id"))
    @Column(name = "evidence", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> evidence = new ArrayList<>(); // Bằng chứng ủng hộ

    @ElementCollection
    @CollectionTable(name = "hypothesis_contradicting_evidence", joinColumns = @JoinColumn(name = "hypothesis_id"))
    @Column(name = "contradicting_evidence", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> contradictingEvidence = new ArrayList<>(); // Bằng chứng không phù hợp

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
