package com.flowpilot.dto.request;

import com.flowpilot.enums.TaskPriority;
import com.flowpilot.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public class TaskRequest {

    public record Create(
        @NotBlank @Size(min = 1, max = 200) String title,
        @Size(max = 2000) String description,
        TaskPriority priority,
        TaskStatus status,
        LocalDate dueDate,
        UUID assigneeId
    ) {}

    public record Update(
        @NotBlank @Size(min = 1, max = 200) String title,
        @Size(max = 2000) String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        UUID assigneeId
    ) {}

    public record MoveTask(
        TaskStatus status,
        Integer position
    ) {}
}
