package com.flowpilot.repository;

import com.flowpilot.entity.Project;
import com.flowpilot.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByWorkspaceIdOrderByCreatedAtDesc(UUID workspaceId);
    List<Project> findByWorkspaceIdAndStatus(UUID workspaceId, ProjectStatus status);

    @Query("SELECT p FROM Project p WHERE p.workspace.id = :workspaceId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Project> searchByName(UUID workspaceId, String q);

    Optional<Project> findByIdAndWorkspaceId(UUID id, UUID workspaceId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.workspace.id = :workspaceId AND t.dueDate < CURRENT_DATE AND t.status != 'DONE'")
    long countOverdueTasksByWorkspace(UUID workspaceId);
}
