package com.flowpilot.repository;

import com.flowpilot.entity.WorkspaceMember;
import com.flowpilot.enums.WorkspaceRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, UUID> {
    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
    List<WorkspaceMember> findByWorkspaceId(UUID workspaceId);
    boolean existsByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);

    @Query("SELECT wm.role FROM WorkspaceMember wm WHERE wm.workspace.id = :workspaceId AND wm.user.id = :userId")
    Optional<WorkspaceRole> findRoleByWorkspaceIdAndUserId(UUID workspaceId, UUID userId);
}
