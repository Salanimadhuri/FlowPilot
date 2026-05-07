package com.flowpilot.util;

import java.text.Normalizer;
import java.util.List;
import java.util.Random;
import java.util.UUID;

public final class WorkspaceUtils {

    private static final List<String[]> GRADIENT_PAIRS = List.of(
        new String[]{"#6366f1", "#8b5cf6"},
        new String[]{"#0ea5e9", "#6366f1"},
        new String[]{"#10b981", "#0ea5e9"},
        new String[]{"#f59e0b", "#ef4444"},
        new String[]{"#ec4899", "#8b5cf6"},
        new String[]{"#14b8a6", "#6366f1"},
        new String[]{"#f97316", "#ec4899"},
        new String[]{"#84cc16", "#10b981"}
    );

    private static final List<String> AVATAR_COLORS = List.of(
        "#6366f1", "#0ea5e9", "#10b981", "#f59e0b",
        "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6"
    );

    private WorkspaceUtils() {}

    public static String slugify(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
            .replaceAll("[^\\p{ASCII}]", "")
            .toLowerCase()
            .trim()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("^-|-$", "");
        return normalized + "-" + UUID.randomUUID().toString().substring(0, 6);
    }

    public static String[] randomGradient() {
        return GRADIENT_PAIRS.get(new Random().nextInt(GRADIENT_PAIRS.size()));
    }

    public static String randomAvatarColor() {
        return AVATAR_COLORS.get(new Random().nextInt(AVATAR_COLORS.size()));
    }

    public static String computeRiskLevel(long overdueCount) {
        if (overdueCount >= 5) return "CRITICAL";
        if (overdueCount >= 3) return "HIGH";
        return "MEDIUM";
    }
}
