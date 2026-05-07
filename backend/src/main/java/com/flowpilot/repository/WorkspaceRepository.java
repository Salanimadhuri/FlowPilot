package com.flowpilot.repository;

import com.flowpilot.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, UUID> {
    Optional<Workspace> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Query("SELECT w FROM Workspace w JOIN w.members m WHERE m.user.id = :userId ORDER BY w.createdAt DESC")
    List<Workspace> findAllByMemberUserId(UUID userId);
}
