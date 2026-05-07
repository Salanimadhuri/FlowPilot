package com.flowpilot.service;

import com.flowpilot.dto.request.WorkspaceRequest;
import com.flowpilot.dto.response.ApiResponse.*;
import com.flowpilot.entity.*;
import com.flowpilot.enums.ActivityType;
import com.flowpilot.enums.WorkspaceRole;
import com.flowpilot.exception.AccessDeniedException;
import com.flowpilot.exception.ConflictException;
import com.flowpilot.exception.ResourceNotFoundException;
import com.flowpilot.repository.*;
import com.flowpilot.util.WorkspaceUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepo;
    private final WorkspaceMemberRepository memberRepo;
    private final UserRepository userRepo;
    private final ActivityLogRepository activityRepo;

    @Transactional
    public WorkspaceDto create(WorkspaceRequest.Create req, User actor) {
        String[] gradient = WorkspaceUtils.randomGradient();
        Workspace ws = Workspace.builder()
            .name(req.name())
            .description(req.description())
            .gradientFrom(gradient[0])
            .gradientTo(gradient[1])
            .slug(WorkspaceUtils.slugify(req.name()))
            .build();
        workspaceRepo.save(ws);

        memberRepo.save(WorkspaceMember.builder()
            .workspace(ws)
            .user(actor)
            .role(WorkspaceRole.ADMIN)
            .build());

        log(ws, actor, ActivityType.MEMBER_ADDED, actor.getName() + " created workspace");
        return toDto(ws);
    }

    public List<WorkspaceDto> listForUser(UUID userId) {
        return workspaceRepo.findAllByMemberUserId(userId)
            .stream().map(this::toDto).toList();
    }

    public WorkspaceDto getBySlug(String slug, UUID userId) {
        Workspace ws = workspaceRepo.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace", slug));
        requireMembership(ws.getId(), userId);
        return toDto(ws);
    }

    @Transactional
    public WorkspaceDto update(UUID id, WorkspaceRequest.Update req, User actor) {
        Workspace ws = requireAdminAccess(id, actor.getId());
        ws.setName(req.name());
        ws.setDescription(req.description());
        return toDto(workspaceRepo.save(ws));
    }

    @Transactional
    public void inviteMember(UUID workspaceId, WorkspaceRequest.InviteMember req, User actor) {
        Workspace ws = requireAdminAccess(workspaceId, actor.getId());
        User target = userRepo.findByEmail(req.email())
            .orElseThrow(() -> new ResourceNotFoundException("User", req.email()));

        if (memberRepo.existsByWorkspaceIdAndUserId(workspaceId, target.getId())) {
            throw new ConflictException("User is already a member of this workspace");
        }
        memberRepo.save(WorkspaceMember.builder()
            .workspace(ws).user(target).role(req.role()).build());

        log(ws, actor, ActivityType.MEMBER_ADDED, actor.getName() + " added " + target.getName());
    }

    @Transactional
    public void removeMember(UUID workspaceId, UUID memberId, User actor) {
        requireAdminAccess(workspaceId, actor.getId());
        WorkspaceMember member = memberRepo.findByWorkspaceIdAndUserId(workspaceId, memberId)
            .orElseThrow(() -> new ResourceNotFoundException("Member", memberId));
        memberRepo.delete(member);
    }

    public List<WorkspaceMemberDto> listMembers(UUID workspaceId, UUID requesterId) {
        requireMembership(workspaceId, requesterId);
        return memberRepo.findByWorkspaceId(workspaceId).stream()
            .map(m -> new WorkspaceMemberDto(
                m.getId(), toUserDto(m.getUser()), m.getRole(), m.getJoinedAt()
            )).toList();
    }

    private Workspace requireAdminAccess(UUID workspaceId, UUID userId) {
        Workspace ws = workspaceRepo.findById(workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId));
        WorkspaceRole role = memberRepo.findRoleByWorkspaceIdAndUserId(workspaceId, userId)
            .orElseThrow(AccessDeniedException::new);
        if (role != WorkspaceRole.ADMIN) throw new AccessDeniedException();
        return ws;
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

    private WorkspaceDto toDto(Workspace ws) {
        return new WorkspaceDto(
            ws.getId(), ws.getName(), ws.getDescription(),
            ws.getGradientFrom(), ws.getGradientTo(), ws.getSlug(),
            ws.getMembers().size(), ws.getProjects().size(), ws.getCreatedAt()
        );
    }

    private UserDto toUserDto(User u) {
        return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getAvatarColor(), u.getRole(), u.getCreatedAt());
    }
}
