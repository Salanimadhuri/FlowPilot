package com.flowpilot.service;

import com.flowpilot.dto.request.ProjectRequest;
import com.flowpilot.dto.response.ApiResponse.*;
import com.flowpilot.entity.*;
import com.flowpilot.enums.ActivityType;
import com.flowpilot.enums.TaskStatus;
import com.flowpilot.exception.AccessDeniedException;
import com.flowpilot.exception.ResourceNotFoundException;
import com.flowpilot.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepo;
    private final WorkspaceRepository workspaceRepo;
    private final WorkspaceMemberRepository memberRepo;
    private final TaskRepository taskRepo;
    private final ActivityLogRepository activityRepo;
    private final UserRepository userRepo;

    @Transactional
    public ProjectDto create(UUID workspaceId, ProjectRequest.Create req, User actor) {
        requireMembership(workspaceId, actor.getId());
        Workspace ws = workspaceRepo.findById(workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId));

        Project project = Project.builder()
            .name(req.name())
            .description(req.description())
            .color(req.color() != null ? req.color() : "#6366f1")
            .dueDate(req.dueDate())
            .workspace(ws)
            .owner(actor)
            .build();
        projectRepo.save(project);

        log(ws, actor, ActivityType.PROJECT_CREATED,
            actor.getName() + " created project \"" + project.getName() + "\"");
        return toDto(project);
    }

    public List<ProjectDto> listByWorkspace(UUID workspaceId, UUID userId) {
        requireMembership(workspaceId, userId);
        List<Project> projects = projectRepo.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
        return projects.stream().map(this::toDto).toList();
    }

    public ProjectDto getById(UUID workspaceId, UUID projectId, UUID userId) {
        requireMembership(workspaceId, userId);
        Project p = projectRepo.findByIdAndWorkspaceId(projectId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        return toDto(p);
    }

    @Transactional
    public ProjectDto update(UUID workspaceId, UUID projectId, ProjectRequest.Update req, User actor) {
        requireMembership(workspaceId, actor.getId());
        Project p = projectRepo.findByIdAndWorkspaceId(projectId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        p.setName(req.name());
        p.setDescription(req.description());
        if (req.status() != null) p.setStatus(req.status());
        if (req.color() != null) p.setColor(req.color());
        p.setDueDate(req.dueDate());

        Workspace ws = workspaceRepo.findById(workspaceId).orElseThrow();
        log(ws, actor, ActivityType.PROJECT_UPDATED,
            actor.getName() + " updated project \"" + p.getName() + "\"");

        return toDto(projectRepo.save(p));
    }

    @Transactional
    public void delete(UUID workspaceId, UUID projectId, User actor) {
        requireMembership(workspaceId, actor.getId());
        Project p = projectRepo.findByIdAndWorkspaceId(projectId, workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        projectRepo.delete(p);
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

    private ProjectDto toDto(Project p) {
        long total = taskRepo.findByProjectIdOrderByPositionAsc(p.getId()).size();
        long done = taskRepo.findByProjectIdAndStatus(p.getId(), TaskStatus.DONE).size();
        long overdue = p.getTasks().stream()
            .filter(t -> t.getDueDate() != null
                && t.getDueDate().isBefore(LocalDate.now())
                && t.getStatus() != TaskStatus.DONE)
            .count();

        UserDto ownerDto = p.getOwner() != null ? new UserDto(
            p.getOwner().getId(), p.getOwner().getName(),
            p.getOwner().getEmail(), p.getOwner().getAvatarColor(),
            p.getOwner().getRole(), p.getOwner().getCreatedAt()) : null;

        return new ProjectDto(
            p.getId(), p.getName(), p.getDescription(), p.getStatus(),
            p.getColor(), p.getDueDate(), ownerDto,
            (int) total, (int) done, (int) overdue,
            p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
