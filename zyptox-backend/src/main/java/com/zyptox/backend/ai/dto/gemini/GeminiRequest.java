package com.zyptox.backend.ai.dto.gemini;

import java.util.List;

public record GeminiRequest(
        List<Content> contents
) {
}