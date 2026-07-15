package com.zyptox.backend.ai.parser;

import com.zyptox.backend.ai.dto.gemini.GeminiResponse;
import org.springframework.stereotype.Component;

@Component
public class ResponseParser {

    public String parse(GeminiResponse response) {

        if (response == null
                || response.candidates() == null
                || response.candidates().isEmpty()) {

            return "No response from Gemini.";
        }

        return response.candidates()
                .get(0)
                .content()
                .parts()
                .get(0)
                .text();
    }
}