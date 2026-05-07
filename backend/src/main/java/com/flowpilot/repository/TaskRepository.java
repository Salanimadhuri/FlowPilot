package com.flowpilot.repository;

import com.flowpilot.entity.Task;
import com.flowpilot.enums.TaskPriority;
import com.flowpilot.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByProjectIdOrderByPositionAsc(UUID projectId);

    List<Task> findByProjectIdAndStatus(UUID projectId, TaskStatus status);

    List<Task> findByProjectIdAndPriority(UUID projectId, TaskPriority priority);

    @Query("SELECT t FROM Task t WHERE t.project.workspace.id = :workspaceId AND t.assignee.id = :userId ORDER BY t.dueDate ASC")
    List<Task> findByWorkspaceAndAssignee(UUID workspaceId, UUID userId);

    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId AND (LOWER(t.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Task> searchByProjectAndQuery(UUID projectId, String q);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.workspace.id = :workspaceId AND t.status = 'DONE'")
    long countCompletedByWorkspace(UUID workspaceId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.workspace.id = :workspaceId")
    long countTotalByWorkspace(UUID workspaceId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.workspace.id = :workspaceId AND t.dueDate < :today AND t.status != 'DONE'")
    long countOverdueByWorkspace(UUID workspaceId, LocalDate today);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.status = 'DONE' AND t.updatedAt >= :since")
    long countRecentlyCompletedByUser(UUID userId, java.time.Instant since);
}
