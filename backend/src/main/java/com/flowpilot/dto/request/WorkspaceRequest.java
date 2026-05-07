package com.flowpilot.dto.request;

import com.flowpilot.enums.WorkspaceRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class WorkspaceRequest {

    public record Create(
        @NotBlank @Size(min = 2, max = 80) String name,
        @Size(max = 300) String description
    ) {}

    public record Update(
        @NotBlank @Size(min = 2, max = 80) String name,
        @Size(max = 300) String description
    ) {}

    public record InviteMember(
        @NotBlank @Email String email,
        @NotNull WorkspaceRole role
    ) {}
}
