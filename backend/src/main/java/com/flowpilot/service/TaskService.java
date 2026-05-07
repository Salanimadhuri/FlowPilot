package com.flowpilot.service;

import com.flowpilot.dto.request.TaskRequest;
import com.flowpilot.dto.response.ApiResponse.*;
import com.flowpilot.entity.*;
import com.flowpilot.enums.ActivityType;
import com.flowpilot.enums.TaskPriority;
import com.flowpilot.enums.TaskStatus;
import com.flowpilot.exception.AccessDeniedException;
import com.flowpilot.exception.ResourceNotFoundException;
import com.flowpilot.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepo;
    private final ProjectRepository projectRepo;
    private final WorkspaceMemberRepository memberRepo;
    private final UserRepository userRepo;
    private final WorkspaceRepository workspaceRepo;
    private final ActivityLogRepository activityRepo;

    @Transactional
    public TaskDto create(UUID workspaceId, UUID projectId, TaskRequest.Create req, User actor) {
        requireMembership(workspaceId, actor.getId());
        Project project = projectRepo.findByIdAndWorkspaceId(projectId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        User assignee = req.assigneeId() != null
            ? userRepo.findById(req.assigneeId()).orElse(null)
            : null;

        int nextPos = taskRepo.findByProjectIdOrderByPositionAsc(projectId).size();

        Task task = Task.builder()
            .title(req.title())
            .description(req.description())
            .priority(req.priority() != null ? req.priority() : TaskPriority.MEDIUM)
            .status(req.status() != null ? req.status() : TaskStatus.TODO)
            .dueDate(req.dueDate())
            .assignee(assignee)
            .reporter(actor)
            .project(project)
            .position(nextPos)
            .build();
        taskRepo.save(task);

        Workspace ws = workspaceRepo.findById(workspaceId).orElseThrow();
        log(ws, actor, ActivityType.TASK_CREATED,
            actor.getName() + " created task \"" + task.getTitle() + "\"");

        return toDto(task);
    }

public List<TaskDto> listByProject(UUID workspaceId, UUID projectId, UUID userId,
                                       TaskStatus status, TaskPriority priority, String q) {
        requireMembership(workspaceId, userId);
        projectRepo.findByIdAndWorkspaceId(projectId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        List<Task> tasks;
        
        if (q != null && !q.isBlank()) {
            tasks = taskRepo.searchByProjectAndQuery(projectId, q);
        } else if (status != null) {
            tasks = taskRepo.findByProjectIdAndStatus(projectId, status);
        } else if (priority != null) {
            tasks = taskRepo.findByProjectIdAndPriority(projectId, priority);
        } else {
            tasks = taskRepo.findByProjectIdOrderByPositionAsc(projectId);
        }
        
        return tasks.stream().map(this::toDto).toList();
    }

    @Transactional
    public TaskDto update(UUID workspaceId, UUID taskId, TaskRequest.Update req, User actor) {
        requireMembership(workspaceId, actor.getId());
        Task task = taskRepo.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        // Members can only update their own assigned tasks
        if (actor.getRole() == com.flowpilot.enums.UserRole.MEMBER) {
            if (task.getAssignee() == null || !task.getAssignee().getId().equals(actor.getId())) {
                throw new AccessDeniedException();
            }
        }

        TaskStatus prevStatus = task.getStatus();
        task.setTitle(req.title());
        task.setDescription(req.description());
        if (req.status() != null) task.setStatus(req.status());
        if (req.priority() != null) task.setPriority(req.priority());
        task.setDueDate(req.dueDate());

        // Only admins can reassign tasks
        if (req.assigneeId() != null && actor.getRole() == com.flowpilot.enums.UserRole.ADMIN) {
            userRepo.findById(req.assigneeId()).ifPresent(task::setAssignee);
        }

        Workspace ws = workspaceRepo.findById(workspaceId).orElseThrow();
        if (req.status() != null && req.status() != prevStatus) {
            log(ws, actor, ActivityType.STATUS_CHANGED,
                actor.getName() + " moved \"" + task.getTitle() + "\" to " + req.status());
        } else {
            log(ws, actor, ActivityType.TASK_UPDATED,
                actor.getName() + " updated \"" + task.getTitle() + "\"");
        }

        return toDto(taskRepo.save(task));
    }

    @Transactional
    public TaskDto moveTask(UUID workspaceId, UUID taskId, TaskRequest.MoveTask req, User actor) {
        requireMembership(workspaceId, actor.getId());
        Task task = taskRepo.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        // Members can only move their own assigned tasks
        if (actor.getRole() == com.flowpilot.enums.UserRole.MEMBER) {
            if (task.getAssignee() == null || !task.getAssignee().getId().equals(actor.getId())) {
                throw new AccessDeniedException();
            }
        }

        TaskStatus prev = task.getStatus();
        if (req.status() != null) task.setStatus(req.status());
        if (req.position() != null) task.setPosition(req.position());

        Workspace ws = workspaceRepo.findById(workspaceId).orElseThrow();
        if (req.status() != null && req.status() != prev) {
            log(ws, actor, ActivityType.TASK_MOVED,
                actor.getName() + " moved \"" + task.getTitle() + "\" → " + req.status());
        }
        return toDto(taskRepo.save(task));
    }

    @Transactional
    public void delete(UUID workspaceId, UUID taskId, User actor) {
        requireMembership(workspaceId, actor.getId());
        Task task = taskRepo.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        taskRepo.delete(task);
    }

    private void requireMembership(UUID workspaceId, UUID userId) {
        if (!memberRepo.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new AccessDeniedException();
        }
    }

    private void log(Workspace ws, User actor, ActivityType type, String msg) {
        activityRepo.save(ActivityLog.builder()
            .workspace(ws).actor(actor).type(type).message(msg).build());
    }

    public TaskDto toDto(Task t) {
        UserDto assigneeDto = t.getAssignee() != null ? new UserDto(
            t.getAssignee().getId(), t.getAssignee().getName(),
            t.getAssignee().getEmail(), t.getAssignee().getAvatarColor(),
            t.getAssignee().getRole(), t.getAssignee().getCreatedAt()) : null;
        UserDto reporterDto = t.getReporter() != null ? new UserDto(
            t.getReporter().getId(), t.getReporter().getName(),
            t.getReporter().getEmail(), t.getReporter().getAvatarColor(),
            t.getReporter().getRole(), t.getReporter().getCreatedAt()) : null;

        return new TaskDto(
            t.getId(), t.getTitle(), t.getDescription(), t.getStatus(), t.getPriority(),
            t.getDueDate(), t.getPosition(), assigneeDto, reporterDto,
            t.getProject().getId(), t.getProject().getName(),
            t.getCreatedAt(), t.getUpdatedAt()
        );
    }
}
