package com.zyptox.backend.ai.security;

import org.springframework.stereotype.Component;

@Component
public class InputGuard {

    private static final String[] BLOCKED = {
            "ignore previous instructions",
            "system prompt",
            "developer instructions",
            "reveal prompt",
            "api key",
            "jailbreak",
            "forget previous instructions"
    };

    public boolean isAllowed(String message) {

        String lower = message.toLowerCase();

        for (String keyword : BLOCKED) {
            if (lower.contains(keyword)) {
                return false;
            }
        }

        return true;
    }
}