package com.flowpilot.controller;

import com.flowpilot.dto.request.ProjectRequest;
import com.flowpilot.dto.response.ApiResponse.*;
import com.flowpilot.service.ProjectService;
import com.flowpilot.util.AuthUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectDto> create(@PathVariable UUID workspaceId,
                                             @Valid @RequestBody ProjectRequest.Create req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(projectService.create(workspaceId, req, AuthUtils.currentUser()));
    }

    @GetMapping
    public ResponseEntity<List<ProjectDto>> list(@PathVariable UUID workspaceId) {
        return ResponseEntity.ok(
            projectService.listByWorkspace(workspaceId, AuthUtils.currentUser().getId()));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectDto> get(@PathVariable UUID workspaceId,
                                          @PathVariable UUID projectId) {
        return ResponseEntity.ok(
            projectService.getById(workspaceId, projectId, AuthUtils.currentUser().getId()));
    }

    @PutMapping("/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectDto> update(@PathVariable UUID workspaceId,
                                             @PathVariable UUID projectId,
                                             @Valid @RequestBody ProjectRequest.Update req) {
        return ResponseEntity.ok(
            projectService.update(workspaceId, projectId, req, AuthUtils.currentUser()));
    }

    @DeleteMapping("/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID workspaceId,
                                       @PathVariable UUID projectId) {
        projectService.delete(workspaceId, projectId, AuthUtils.currentUser());
        return ResponseEntity.noContent().build();
    }
}
