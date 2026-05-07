package com.flowpilot.entity;

import com.flowpilot.enums.ActivityType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "activity_logs", indexes = {
    @Index(name = "idx_activity_workspace", columnList = "workspace_id"),
    @Index(name = "idx_activity_created", columnList = "created_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ActivityType type;

    @Column(nullable = false, length = 300)
    private String message;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "entity_type", length = 30)
    private String entityType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @CreationTimestamp
    private Instant createdAt;
}
