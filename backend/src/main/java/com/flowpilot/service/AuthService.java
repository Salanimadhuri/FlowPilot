package com.flowpilot.service;

import com.flowpilot.dto.request.AuthRequest;
import com.flowpilot.dto.response.ApiResponse.*;
import com.flowpilot.entity.RefreshToken;
import com.flowpilot.entity.User;
import com.flowpilot.enums.UserRole;
import com.flowpilot.exception.ConflictException;
import com.flowpilot.exception.InvalidTokenException;
import com.flowpilot.exception.ResourceNotFoundException;
import com.flowpilot.repository.RefreshTokenRepository;
import com.flowpilot.repository.UserRepository;
import com.flowpilot.security.JwtProvider;
import com.flowpilot.util.WorkspaceUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final RefreshTokenRepository rtRepo;
    private final PasswordEncoder encoder;
    private final JwtProvider jwtProvider;

    @Value("${flowpilot.jwt.refresh-expiry-ms}")
    private long refreshExpiryMs;

    @Transactional
    public AuthTokens register(AuthRequest.Register req) {
        if (userRepo.existsByEmail(req.email())) {
            throw new ConflictException("Email already registered");
        }
        if (!req.password().equals(req.confirmPassword())) {
            throw new ConflictException("Passwords do not match");
        }
        User user = User.builder()
            .name(req.name())
            .email(req.email())
            .passwordHash(encoder.encode(req.password()))
            .avatarColor(WorkspaceUtils.randomAvatarColor())
            .role(req.role() != null ? req.role() : UserRole.MEMBER)
            .build();
        userRepo.save(user);
        return issueTokens(user);
    }

    @Transactional
    public AuthTokens login(AuthRequest.Login req) {
        User user = userRepo.findByEmail(req.email())
            .orElseThrow(() -> new ResourceNotFoundException("User", req.email()));

        if (!encoder.matches(req.password(), user.getPasswordHash())) {
            throw new InvalidTokenException();
        }
        return issueTokens(user);
    }

    @Transactional
    public AuthTokens refresh(AuthRequest.RefreshRequest req) {
        RefreshToken stored = rtRepo.findByToken(req.refreshToken())
            .orElseThrow(InvalidTokenException::new);

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidTokenException();
        }
        stored.setRevoked(true);
        rtRepo.save(stored);
        return issueTokens(stored.getUser());
    }

    @Transactional
    public void logout(UUID userId) {
        rtRepo.revokeAllByUserId(userId);
    }

    private AuthTokens issueTokens(User user) {
        String access = jwtProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String rawRefresh = UUID.randomUUID().toString();

        rtRepo.save(RefreshToken.builder()
            .token(rawRefresh)
            .user(user)
            .expiresAt(Instant.now().plusMillis(refreshExpiryMs))
            .build());

        return new AuthTokens(access, rawRefresh, toDto(user));
    }

    private UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getAvatarColor(), u.getRole(), u.getCreatedAt());
    }
}
