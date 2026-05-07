package com.flowpilot.controller;

import com.flowpilot.dto.request.WorkspaceRequest;
import com.flowpilot.dto.response.ApiResponse.*;
import com.flowpilot.entity.User;
import com.flowpilot.service.WorkspaceService;
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
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<WorkspaceDto> create(@Valid @RequestBody WorkspaceRequest.Create req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(workspaceService.create(req, AuthUtils.currentUser()));
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceDto>> list() {
        return ResponseEntity.ok(workspaceService.listForUser(AuthUtils.currentUser().getId()));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<WorkspaceDto> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(workspaceService.getBySlug(slug, AuthUtils.currentUser().getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WorkspaceDto> update(@PathVariable UUID id,
                                               @Valid @RequestBody WorkspaceRequest.Update req) {
        return ResponseEntity.ok(workspaceService.update(id, req, AuthUtils.currentUser()));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<WorkspaceMemberDto>> members(@PathVariable UUID id) {
        return ResponseEntity.ok(workspaceService.listMembers(id, AuthUtils.currentUser().getId()));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> invite(@PathVariable UUID id,
                                       @Valid @RequestBody WorkspaceRequest.InviteMember req) {
        workspaceService.inviteMember(id, req, AuthUtils.currentUser());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}/members/{memberId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeMember(@PathVariable UUID id,
                                             @PathVariable UUID memberId) {
        workspaceService.removeMember(id, memberId, AuthUtils.currentUser());
        return ResponseEntity.noContent().build();
    }
}
