package com.zyptox.backend.ai.client;

import com.zyptox.backend.ai.config.GeminiConfig;
import com.zyptox.backend.ai.dto.gemini.*;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class GeminiClient {

    private final RestClient restClient;
    private final GeminiConfig geminiConfig;

    public GeminiClient(GeminiConfig geminiConfig) {
        this.geminiConfig = geminiConfig;
        this.restClient = RestClient.builder().build();
    }

    public GeminiResponse generateResponse(String prompt) {

        GeminiRequest request = buildRequest(prompt);

        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/"
                        + geminiConfig.getModel()
                        + ":generateContent";
        System.out.println(url);

        return restClient.post()
                .uri(url)
                .header("x-goog-api-key", geminiConfig.getApiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(GeminiResponse.class);
    }

    private GeminiRequest buildRequest(String prompt) {

        Part part = new Part(prompt);

        Content content = new Content(List.of(part));

        return new GeminiRequest(List.of(content));
    }
}