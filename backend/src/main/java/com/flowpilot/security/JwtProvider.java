package com.flowpilot.security;

import com.flowpilot.enums.UserRole;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtProvider {

    @Value("${flowpilot.jwt.secret}")
    private String jwtSecret;

    @Value("${flowpilot.jwt.access-expiry-ms}")
    private long accessExpiryMs;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String generateAccessToken(UUID userId, String email, UserRole role) {
        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .claim("role", role.name())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessExpiryMs))
            .signWith(signingKey())
            .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
            .verifyWith(signingKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseToken(token).getSubject());
    }

    public String extractRole(String token) {
        return parseToken(token).get("role", String.class);
    }

    public boolean isValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
