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

        String text = response.candidates().get(0).content().parts().get(0).text();
        return text != null ? text.trim() : "Empty response from Gemini.";
    }
}