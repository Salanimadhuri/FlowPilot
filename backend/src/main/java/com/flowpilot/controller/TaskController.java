package com.flowpilot.controller;

import com.flowpilot.dto.request.TaskRequest;
import com.flowpilot.dto.response.ApiResponse.*;
import com.flowpilot.enums.TaskPriority;
import com.flowpilot.enums.TaskStatus;
import com.flowpilot.service.TaskService;
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
@RequestMapping("/api/workspaces/{workspaceId}/projects/{projectId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

@PostMapping
    public ResponseEntity<TaskDto> create(@PathVariable UUID workspaceId,
                                          @PathVariable UUID projectId,
                                          @Valid @RequestBody TaskRequest.Create req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(taskService.create(workspaceId, projectId, req, AuthUtils.currentUser()));
    }

    @GetMapping
    public ResponseEntity<List<TaskDto>> list(@PathVariable UUID workspaceId,
                                              @PathVariable UUID projectId,
                                              @RequestParam(required = false) TaskStatus status,
                                              @RequestParam(required = false) TaskPriority priority,
                                              @RequestParam(required = false) String q) {
        return ResponseEntity.ok(
            taskService.listByProject(workspaceId, projectId, AuthUtils.currentUser().getId(),
                status, priority, q));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskDto> update(@PathVariable UUID workspaceId,
                                          @PathVariable UUID projectId,
                                          @PathVariable UUID taskId,
                                          @Valid @RequestBody TaskRequest.Update req) {
        return ResponseEntity.ok(taskService.update(workspaceId, taskId, req, AuthUtils.currentUser()));
    }

    @PatchMapping("/{taskId}/move")
    public ResponseEntity<TaskDto> move(@PathVariable UUID workspaceId,
                                        @PathVariable UUID projectId,
                                        @PathVariable UUID taskId,
                                        @RequestBody TaskRequest.MoveTask req) {
        return ResponseEntity.ok(taskService.moveTask(workspaceId, taskId, req, AuthUtils.currentUser()));
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID workspaceId,
                                       @PathVariable UUID projectId,
                                       @PathVariable UUID taskId) {
        taskService.delete(workspaceId, taskId, AuthUtils.currentUser());
        return ResponseEntity.noContent().build();
    }
}
