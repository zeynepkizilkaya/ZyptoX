package com.zyptox.backend.ai.parser;

import com.zyptox.backend.ai.dto.gemini.GeminiResponse;
import org.springframework.stereotype.Component;

@Component
public class ResponseParser {

    public String parse(GeminiResponse response) {

        if (response == null
                || response.candidates() == null
                || response.candidates().isEmpty()
                || response.candidates().get(0).content() == null
                || response.candidates().get(0).content().parts() == null
                || response.candidates().get(0).content().parts().isEmpty()) {

            return "No response from Gemini.";
        }

        String text = response.candidates()
                .get(0)
                .content()
                .parts()
                .get(0)
                .text();

        if (text == null) {
            return "Empty response.";
        }

        text = text.trim();

        String lower = text.toLowerCase();

        if (lower.contains("system prompt")
                || lower.contains("developer instructions")
                || lower.contains("api key")
                || lower.contains("internal instructions")) {

            return "⚠️ The response was blocked for security reasons.";
        }

        return text;
    }
}