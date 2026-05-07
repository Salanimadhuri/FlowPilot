package com.flowpilot.dto.request;

import com.flowpilot.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class ProjectRequest {

    public record Create(
        @NotBlank @Size(min = 2, max = 120) String name,
        @Size(max = 500) String description,
        String color,
        LocalDate dueDate
    ) {}

    public record Update(
        @NotBlank @Size(min = 2, max = 120) String name,
        @Size(max = 500) String description,
        ProjectStatus status,
        String color,
        LocalDate dueDate
    ) {}
}
