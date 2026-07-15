package com.zyptox.backend.ai.dto.gemini;

import java.util.List;

public record Content(
        List<Part> parts
) {
}