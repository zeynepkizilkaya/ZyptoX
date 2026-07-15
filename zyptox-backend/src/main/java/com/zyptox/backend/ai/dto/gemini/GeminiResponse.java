package com.zyptox.backend.ai.dto.gemini;

import java.util.List;

public record GeminiResponse(
        List<Candidate> candidates
) {
}