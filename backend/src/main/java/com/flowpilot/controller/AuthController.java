package com.flowpilot.controller;

import com.flowpilot.dto.request.AuthRequest;
import com.flowpilot.dto.response.ApiResponse.*;
import com.flowpilot.entity.User;
import com.flowpilot.service.AuthService;
import com.flowpilot.util.AuthUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthTokens> register(@Valid @RequestBody AuthRequest.Register req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthTokens> login(@Valid @RequestBody AuthRequest.Login req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthTokens> refresh(@Valid @RequestBody AuthRequest.RefreshRequest req) {
        return ResponseEntity.ok(authService.refresh(req));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        User current = AuthUtils.currentUser();
        authService.logout(current.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me() {
        User u = AuthUtils.currentUser();
        return ResponseEntity.ok(
            new UserDto(u.getId(), u.getName(), u.getEmail(), u.getAvatarColor(), u.getRole(), u.getCreatedAt())
        );
    }
}
