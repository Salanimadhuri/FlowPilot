package com.flowpilot.util;

import com.flowpilot.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;

public final class AuthUtils {

    private AuthUtils() {}

    public static User currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User user)) {
            throw new IllegalStateException("No authenticated user in context");
        }
        return user;
    }
}
