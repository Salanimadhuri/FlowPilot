package com.flowpilot.controller;

import com.flowpilot.dto.response.ApiResponse.DashboardStats;
import com.flowpilot.dto.response.ApiResponse.MemberDashboardStats;
import com.flowpilot.entity.User;
import com.flowpilot.enums.UserRole;
import com.flowpilot.service.DashboardService;
import com.flowpilot.util.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<?> stats(@PathVariable UUID workspaceId) {
        User user = AuthUtils.currentUser();
        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        if (isAdmin) {
            return ResponseEntity.ok(dashboardService.getAdminStats(workspaceId, user));
        } else {
            return ResponseEntity.ok(dashboardService.getMemberStats(workspaceId, user));
        }
    }
}
