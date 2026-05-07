package com.flowpilot.dto.request;

import com.flowpilot.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AuthRequest {

    public record Register(
        @NotBlank @Size(min = 2, max = 80) String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank @Size(min = 8, max = 72) String confirmPassword,
        UserRole role
    ) {}

    public record Login(
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record RefreshRequest(
        @NotBlank String refreshToken
    ) {}
}
