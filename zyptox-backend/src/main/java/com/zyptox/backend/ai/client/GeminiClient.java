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

        String url = "https://generativelanguage.googleapis.com/v1/models/"
                + geminiConfig.getModel()
                + ":generateContent";

        String apiKey = geminiConfig.getApiKey();
        boolean isAccessToken = apiKey != null && (apiKey.startsWith("AQ.") || apiKey.startsWith("ya29."));

        try {
            var spec = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request);
            
            if (isAccessToken) {
                spec.header("Authorization", "Bearer " + apiKey);
            } else {
                spec.header("x-goog-api-key", apiKey);
            }

            return spec.retrieve().body(GeminiResponse.class);
        } catch (Exception e) {
            throw e;
        }
    }

    private GeminiRequest buildRequest(String prompt) {

        Part part = new Part(prompt);

        Content content = new Content(List.of(part));

        return new GeminiRequest(List.of(content));
    }
}