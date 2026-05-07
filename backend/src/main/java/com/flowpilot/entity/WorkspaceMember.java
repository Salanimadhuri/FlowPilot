package com.flowpilot.entity;

import com.flowpilot.enums.WorkspaceRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "workspace_members",
    uniqueConstraints = @UniqueConstraint(columnNames = {"workspace_id", "user_id"}),
    indexes = {
        @Index(name = "idx_wm_workspace", columnList = "workspace_id"),
        @Index(name = "idx_wm_user", columnList = "user_id")
    })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkspaceMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkspaceRole role;

    @CreationTimestamp
    private Instant joinedAt;
}
