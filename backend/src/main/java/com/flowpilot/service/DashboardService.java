package com.flowpilot.service;

import com.flowpilot.dto.response.ApiResponse.*;
import com.flowpilot.entity.ActivityLog;
import com.flowpilot.entity.Project;
import com.flowpilot.entity.Task;
import com.flowpilot.entity.User;
import com.flowpilot.enums.TaskStatus;
import com.flowpilot.exception.AccessDeniedException;
import com.flowpilot.repository.*;
import com.flowpilot.util.WorkspaceUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepo;
    private final ProjectRepository projectRepo;
    private final WorkspaceMemberRepository memberRepo;
    private final ActivityLogRepository activityRepo;

    public DashboardStats getAdminStats(UUID workspaceId, User actor) {
        if (!memberRepo.existsByWorkspaceIdAndUserId(workspaceId, actor.getId())) {
            throw new AccessDeniedException();
        }

        long total = taskRepo.countTotalByWorkspace(workspaceId);
        long completed = taskRepo.countCompletedByWorkspace(workspaceId);
        long overdue = taskRepo.countOverdueByWorkspace(workspaceId, LocalDate.now());

        List<Project> projects = projectRepo.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        long inProgress = projects.stream()
            .flatMap(p -> p.getTasks().stream())
            .filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS)
            .count();

        double focusMeter = total == 0 ? 0.0
            : Math.round(((double) completed / (total + overdue)) * 100.0) / 1.0;

        int momentum = computeMomentum(actor.getId());
        List<RiskAlert> riskAlerts = buildRiskAlerts(projects);

        List<ActivityDto> recentActivity = activityRepo
            .findByWorkspaceIdOrderByCreatedAtDesc(workspaceId, PageRequest.of(0, 15))
            .getContent().stream()
            .map(this::toActivityDto)
            .toList();

        return new DashboardStats(
            total, completed, overdue, inProgress,
            focusMeter, momentum, riskAlerts, recentActivity
        );
    }

    public MemberDashboardStats getMemberStats(UUID workspaceId, User actor) {
        if (!memberRepo.existsByWorkspaceIdAndUserId(workspaceId, actor.getId())) {
            throw new AccessDeniedException();
        }

        List<Project> projects = projectRepo.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        List<Task> assignedTasks = projects.stream()
            .flatMap(p -> p.getTasks().stream())
            .filter(t -> t.getAssignee() != null && t.getAssignee().getId().equals(actor.getId()))
            .collect(Collectors.toList());

        long assigned = assignedTasks.size();
        long completed = assignedTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long overdue = assignedTasks.stream()
            .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()) && t.getStatus() != TaskStatus.DONE)
            .count();
        long inProgress = assignedTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();

        double focusMeter = assigned == 0 ? 0.0
            : Math.round(((double) completed / (assigned + overdue)) * 100.0) / 1.0;

        List<TaskDto> upcomingDeadlines = assignedTasks.stream()
            .filter(t -> t.getDueDate() != null && !t.getDueDate().isBefore(LocalDate.now()) && t.getStatus() != TaskStatus.DONE)
            .sorted((a, b) -> a.getDueDate().compareTo(b.getDueDate()))
            .limit(5)
            .map(this::toTaskDto)
            .collect(Collectors.toList());

        List<ActivityDto> recentActivity = activityRepo
            .findByWorkspaceIdOrderByCreatedAtDesc(workspaceId, PageRequest.of(0, 10))
            .getContent().stream()
            .filter(a -> a.getActor() != null && a.getActor().getId().equals(actor.getId()))
            .map(this::toActivityDto)
            .limit(10)
            .collect(Collectors.toList());

        return new MemberDashboardStats(
            assigned, completed, overdue, inProgress,
            focusMeter, upcomingDeadlines, recentActivity
        );
    }

    private int computeMomentum(UUID userId) {
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        long recent = taskRepo.countRecentlyCompletedByUser(userId, sevenDaysAgo);
        return (int) Math.min(recent, 7);
    }

    private List<RiskAlert> buildRiskAlerts(List<Project> projects) {
        List<RiskAlert> alerts = new ArrayList<>();
        for (Project p : projects) {
            long overdueInProject = p.getTasks().stream()
                .filter(t -> t.getDueDate() != null
                    && t.getDueDate().isBefore(LocalDate.now())
                    && t.getStatus() != TaskStatus.DONE)
                .count();
            if (overdueInProject >= 2) {
                alerts.add(new RiskAlert(
                    p.getId(), p.getName(),
                    overdueInProject,
                    WorkspaceUtils.computeRiskLevel(overdueInProject)
                ));
            }
        }
        return alerts;
    }

    private ActivityDto toActivityDto(ActivityLog a) {
        UserDto actor = a.getActor() != null ? new UserDto(
            a.getActor().getId(), a.getActor().getName(),
            a.getActor().getEmail(), a.getActor().getAvatarColor(),
            a.getActor().getRole(), a.getActor().getCreatedAt()) : null;

        return new ActivityDto(
            a.getId(), a.getType(), a.getMessage(),
            actor, a.getEntityId(), a.getEntityType(), a.getCreatedAt()
        );
    }

    private TaskDto toTaskDto(Task t) {
        UserDto assignee = t.getAssignee() != null ? new UserDto(
            t.getAssignee().getId(), t.getAssignee().getName(),
            t.getAssignee().getEmail(), t.getAssignee().getAvatarColor(),
            t.getAssignee().getRole(), t.getAssignee().getCreatedAt()) : null;

        UserDto reporter = t.getReporter() != null ? new UserDto(
            t.getReporter().getId(), t.getReporter().getName(),
            t.getReporter().getEmail(), t.getReporter().getAvatarColor(),
            t.getReporter().getRole(), t.getReporter().getCreatedAt()) : null;

        return new TaskDto(
            t.getId(), t.getTitle(), t.getDescription(),
            t.getStatus(), t.getPriority(), t.getDueDate(), t.getPosition(),
            assignee, reporter, t.getProject().getId(), t.getProject().getName(),
            t.getCreatedAt(), t.getUpdatedAt()
        );
    }
}
