package com.flowpilot.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "workspaces")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 300)
    private String description;

    @Column(nullable = false, length = 20)
    private String gradientFrom;

    @Column(nullable = false, length = 20)
    private String gradientTo;

    @Column(unique = true, nullable = false, length = 60)
    private String slug;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkspaceMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Project> projects = new ArrayList<>();

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ActivityLog> activityLogs = new ArrayList<>();
}
