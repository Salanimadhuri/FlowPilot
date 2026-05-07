package com.flowpilot.dto.response;

import com.flowpilot.enums.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ApiResponse {

    public record UserDto(
        UUID id,
        String name,
        String email,
        String avatarColor,
        UserRole role,
        Instant createdAt
    ) {}

    public record AuthTokens(
        String accessToken,
        String refreshToken,
        UserDto user
    ) {}

    public record WorkspaceDto(
        UUID id,
        String name,
        String description,
        String gradientFrom,
        String gradientTo,
        String slug,
        int memberCount,
        int projectCount,
        Instant createdAt
    ) {}

    public record WorkspaceMemberDto(
        UUID id,
        UserDto user,
        WorkspaceRole role,
        Instant joinedAt
    ) {}

    public record ProjectDto(
        UUID id,
        String name,
        String description,
        ProjectStatus status,
        String color,
        LocalDate dueDate,
        UserDto owner,
        int taskCount,
        int completedTaskCount,
        int overdueTaskCount,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record TaskDto(
        UUID id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        Integer position,
        UserDto assignee,
        UserDto reporter,
        UUID projectId,
        String projectName,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record ActivityDto(
        UUID id,
        ActivityType type,
        String message,
        UserDto actor,
        UUID entityId,
        String entityType,
        Instant createdAt
    ) {}

    public record DashboardStats(
        long totalTasks,
        long completedTasks,
        long overdueTasks,
        long inProgressTasks,
        double focusMeter,
        int dailyMomentum,
        List<RiskAlert> riskAlerts,
        List<ActivityDto> recentActivity
    ) {}

    public record MemberDashboardStats(
        long assignedTasks,
        long completedTasks,
        long overdueTasks,
        long inProgressTasks,
        double focusMeter,
        List<TaskDto> upcomingDeadlines,
        List<ActivityDto> recentActivity
    ) {}

    public record RiskAlert(
        UUID projectId,
        String projectName,
        long overdueCount,
        String riskLevel
    ) {}

    public record PagedResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
    ) {}

    public record ErrorResponse(
        int status,
        String error,
        String message,
        Instant timestamp
    ) {}
}
